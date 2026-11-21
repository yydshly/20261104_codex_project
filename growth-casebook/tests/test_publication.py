import hashlib
import json

from bs4 import BeautifulSoup
from fastapi.testclient import TestClient

from casebook.app import create_app
from casebook.collect import source
from casebook.models import Collection, Report
from casebook.report import build_report, validate_references
from publish_snapshot import ROOT, clean_reference, export_publication


def test_publication_keeps_reports_versions_and_original_guide_but_excludes_private_state(tmp_path):
    app = create_app(tmp_path / 'private.sqlite3', start_worker=False)
    with TestClient(app) as client:
        db = app.state.database
        for number in [1, 2]:
            task, _ = db.enqueue('demo.example', 'https://demo.example/', 'Demo', '软件工具', '')
            job = db.claim()
            evidence = source('website', 'Demo', 'https://demo.example/', 'Public product description. ' * 30 + 'RAW_TEXT_AFTER_EXCERPT',
                metadata={'api_key': 'PRIVATE_KEY_MUST_NOT_PUBLISH', 'local_path': 'C:/Users/private/state'},
                links=[{'url': 'http://127.0.0.1/private', 'text': 'Local'}, {'url': 'https://demo.example/pricing', 'text': 'Pricing'}])
            collection = Collection(name='Demo', description='A useful team workspace.', website='https://demo.example/',
                sources=[evidence], warnings=['C:/Users/private/runtime could not complete'], discovered_accounts=[])
            report = build_report(task['project_id'], collection)
            assert db.publish(task['id'], job['attempt'], collection, report)
        excluded, _ = db.enqueue('excluded.example', 'https://excluded.example/', 'NOT_PUBLIC_PROJECT', '软件工具', '')
        db.set_project_hidden(excluded['project_id'], 'Excluded fixture')
        destination = tmp_path / 'public'
        manifest = export_publication(client, destination)
        catalog = json.loads((destination / 'snapshot/catalog.json').read_text(encoding='utf-8'))
        assert catalog['stats']['projects'] == 1
        assert manifest['reports'] == 2
        assert len(catalog['versions'][task['project_id']]) == 2
        assert all(item['project_id'] == task['project_id'] for item in catalog['tasks'])
        for version in [1, 2]:
            published = json.loads((destination / f"snapshot/reports/{task['project_id']}/v{version}.json").read_text(encoding='utf-8'))
            validate_references(Report.model_validate(published))
            assert len(published['sources'][0]['text']) <= 280
            assert published['sources'][0]['metadata'] == {'public_excerpt': True}
            assert published['sources'][0]['links'] == [{'url': 'https://demo.example/pricing', 'text': 'Pricing'}]
        serialized = '\n'.join(path.read_text(encoding='utf-8') for path in destination.rglob('*.json'))
        for private in ['PRIVATE_KEY_MUST_NOT_PUBLISH', 'RAW_TEXT_AFTER_EXCERPT', 'C:/Users/private', 'NOT_PUBLIC_PROJECT']:
            assert private not in serialized
        assert not list(destination.rglob('*.sqlite3'))
        assert not list(destination.rglob('.env'))
        for extension in ['png', 'svg']:
            relative = f'static/research-map/research-overview.{extension}'
            assert (ROOT / relative).read_bytes() == (destination / relative).read_bytes()
        assert manifest['guide_sha256'] == hashlib.sha256((ROOT / 'static/research-map/research-overview.png').read_bytes()).hexdigest()
        page = BeautifulSoup((destination / 'index.html').read_text(encoding='utf-8'), 'html.parser')
        assert page.select_one('meta[name="casebook-mode"]')['content'] == 'public-snapshot'
        assert page.select_one('.publication-banner')
        assert not page.select('[data-new-project]')
        assert not page.select('[href^="/static/"],[src^="/static/"]')
        assert set(manifest['files']) == {str(path.relative_to(destination)).replace('\\', '/') for path in destination.rglob('*') if path.is_file()}


def test_published_references_keep_public_sources_and_remove_private_hosts_and_secret_query_values():
    assert clean_reference('https://example.com/pricing?ref=ph&access_token=private#plans') == 'https://example.com/pricing?ref=ph#plans'
    for address in ['http://127.0.0.1/private', 'http://localhost/', 'http://192.168.1.1/', 'http://service.internal/', 'https://user:password@example.com/', 'https://example.com:8000/', 'file:///C:/Users/private']:
        assert clean_reference(address) == ''
