import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const port = Number(process.argv[2] ?? process.env.PORT ?? 4184);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("端口必须是 1 到 65535 之间的整数。");
}

const root = await realpath(fileURLToPath(new URL("./dist/", import.meta.url)));
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function reply(response, status, message, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    ...headers,
  });
  response.end(message);
}

function insideRoot(file) {
  const fromRoot = relative(root, file);
  return fromRoot !== ".." && !fromRoot.startsWith(`..${sep}`) && !isAbsolute(fromRoot);
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    reply(response, 405, "Method Not Allowed", { Allow: "GET, HEAD" });
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, `http://${host}`).pathname);
  } catch {
    reply(response, 400, "Bad Request");
    return;
  }
  if (pathname.includes("\\") || pathname.includes(":") || pathname.includes("\0")) {
    reply(response, 400, "Bad Request");
    return;
  }

  const requestedFile = resolve(root, pathname === "/" ? "index.html" : `.${pathname}`);
  if (!insideRoot(requestedFile)) {
    reply(response, 404, "Not Found");
    return;
  }

  try {
    const file = await realpath(requestedFile);
    if (!insideRoot(file)) {
      reply(response, 404, "Not Found");
      return;
    }
    const info = await stat(file);
    if (!info.isFile()) {
      reply(response, 404, "Not Found");
      return;
    }

    const extension = extname(file);
    const isolation = extension === ".html" ? {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless",
      "Permissions-Policy": 'cross-origin-isolated=(self "https://adamwebsite.com")',
    } : {};
    response.writeHead(200, {
      "Cache-Control": "no-cache",
      "Content-Length": info.size,
      "Content-Type": contentTypes[extension] ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      ...isolation,
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    await pipeline(createReadStream(file), response);
  } catch (error) {
    if (response.headersSent || response.destroyed) return;
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      reply(response, 404, "Not Found");
      return;
    }
    console.error(error.message);
    reply(response, 500, "Internal Server Error");
  }
});

server.on("error", (error) => {
  console.error(error.code === "EADDRINUSE" ? `端口 ${port} 已被占用，可指定其他端口。` : error.message);
  process.exitCode = 1;
});
server.listen(port, host, () => {
  console.log(`创意 3D 展示站运行于 http://${host}:${port}/`);
});
