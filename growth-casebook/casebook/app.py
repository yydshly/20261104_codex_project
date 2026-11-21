import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.trustedhost import TrustedHostMiddleware

from .db import Database
from .models import DiscoverySettings, ProjectInput, WebsiteInput
from .network import CollectionError, github_repository, project_address
from .worker import Worker
from .website_resolver import website_address


ROOT = Path(__file__).resolve().parent.parent


def create_app(database_path=None, start_worker=True):
    @asynccontextmanager
    async def lifespan(app):
        path = Path(database_path or os.environ.get("CASEBOOK_DB", ROOT / "data" / "casebook.sqlite3"))
        app.state.database = Database(path)
        app.state.worker = Worker(app.state.database)
        if start_worker:
            app.state.worker.start()
        yield
        if start_worker:
            app.state.worker.stop()

    app = FastAPI(title="Growth Casebook", version="0.1.0", lifespan=lifespan)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["127.0.0.1", "localhost", "[::1]", "testserver"])

    @app.middleware("http")
    async def local_write_protection(request: Request, call_next):
        if request.method not in {"GET", "HEAD", "OPTIONS"}:
            origin = request.headers.get("origin")
            if origin and origin != str(request.base_url).rstrip("/"):
                return JSONResponse({"detail": "请求来源与本地应用不一致"}, status_code=403)
            if request.headers.get("sec-fetch-site") == "cross-site":
                return JSONResponse({"detail": "请从本地研究台提交任务"}, status_code=403)
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Content-Security-Policy"] = "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        return response

    @app.get("/api/health")
    def health():
        return {"status": "ok", "data_mode": "free_public", "writer_mode": "local_model" if os.environ.get("CASEBOOK_OLLAMA_MODEL") else "evidence"}

    @app.get("/api/discovery")
    def discovery(request: Request):
        result = request.app.state.worker.discovery.snapshot()
        result["translation_ready"] = request.app.state.worker.translator.available()
        return result

    @app.put("/api/discovery/settings")
    def discovery_settings(payload: DiscoverySettings, request: Request):
        result = request.app.state.worker.discovery.configure(**payload.model_dump())
        request.app.state.worker.wake.set()
        return result

    @app.post("/api/discovery/runs", status_code=202)
    def discover_products(request: Request):
        try:
            run, created = request.app.state.worker.discovery.enqueue()
        except CollectionError as error:
            raise HTTPException(409, str(error)) from error
        request.app.state.worker.wake.set()
        return {"run_id": run["id"], "created": created}

    @app.get("/api/projects")
    def projects(request: Request, q: str = Query(default="", max_length=200), channel: str = Query(default="", max_length=50)):
        return {"items": request.app.state.database.projects(q, channel)}

    @app.get("/api/stats")
    def stats(request: Request):
        items = request.app.state.database.projects()
        return {
            "projects": len(items), "sources": sum(item["source_count"] for item in items),
            "actions": sum(item["action_count"] for item in items),
            "channels": len({channel for item in items for channel in item["channels"] if channel not in {"产品更新", "项目历史"}}),
        }

    @app.post("/api/projects", status_code=202)
    def create_project(payload: ProjectInput, request: Request):
        try:
            identity, website, inferred_repository = project_address(payload.url)
            repository = github_repository(payload.github) if payload.github.strip() else inferred_repository
        except CollectionError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error
        name = payload.name.strip() or (repository.split("/")[-1] if identity.startswith("github:") else identity)
        task, created = request.app.state.database.enqueue(identity, website, name, payload.category, repository or "")
        request.app.state.worker.wake.set()
        return {"task": task, "created": created}

    @app.get("/api/tasks")
    def tasks(request: Request):
        return {"items": request.app.state.database.list_tasks()}

    @app.get("/api/tasks/{task_id}")
    def task(task_id: str, request: Request):
        result = request.app.state.database.get_task(task_id)
        if result is None:
            raise HTTPException(404, "任务不存在")
        return result

    @app.get("/api/projects/{project_id}")
    def project(project_id: str, request: Request, version: int | None = Query(default=None, ge=1)):
        database = request.app.state.database
        item = database.project(project_id)
        if item is None:
            raise HTTPException(404, "项目不存在")
        report = database.report(project_id, version)
        if report is None:
            raise HTTPException(404, "该项目或指定版本还没有已发布报告")
        return {"project": item, "report": report, "versions": database.versions(project_id)}

    @app.post("/api/projects/{project_id}/refresh", status_code=202)
    def refresh(project_id: str, request: Request):
        database = request.app.state.database
        project = database.project(project_id)
        if project is None:
            raise HTTPException(404, "项目不存在")
        task, created = database.enqueue(project["identity"], project["website"], project["name"], project["category"], project["github"])
        request.app.state.worker.wake.set()
        return {"task": task, "created": created}

    @app.post("/api/projects/{project_id}/website", status_code=202)
    def attach_website(project_id: str, payload: WebsiteInput, request: Request):
        database = request.app.state.database
        project = database.project(project_id)
        if project is None:
            raise HTTPException(404, "产品不存在")
        origins = request.app.state.worker.discovery.origins_for_project(project_id)
        if not any(origin["source_kind"] == "product_hunt" for origin in origins):
            raise HTTPException(409, "这个入口用于补充 Product Hunt 产品的官网")
        try:
            identity, website = website_address(payload.url)
            database.attach_website(project_id, identity, website)
        except CollectionError as error:
            raise HTTPException(422, str(error)) from error
        except ValueError as error:
            raise HTTPException(409, str(error)) from error
        task, created = database.enqueue(identity, website, project["name"], project["category"], project["github"])
        request.app.state.worker.wake.set()
        return {"task": task, "created": created}

    @app.get("/api/projects/{project_id}/report.json")
    def export_report(project_id: str, request: Request, version: int | None = Query(default=None, ge=1)):
        report = request.app.state.database.report(project_id, version)
        if report is None:
            raise HTTPException(404, "报告不存在")
        return JSONResponse(report, headers={"Content-Disposition": f'attachment; filename="casebook-{project_id}-v{report["version"]}.json"'})

    @app.get("/")
    def index():
        return FileResponse(ROOT / "static" / "index.html")

    app.mount("/static", StaticFiles(directory=ROOT / "static"), name="static")
    return app


app = create_app()
