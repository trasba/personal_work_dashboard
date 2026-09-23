import pytest
from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

def test_system_health():
    """Verify system health endpoint reports platform status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "platform" in data
    assert "pywin32_available" in data
    assert "outlook_connection" in data

def test_get_outlook_inbox():
    """Verify Outlook inbox endpoint returns list of messages."""
    response = client.get("/api/outlook/inbox?limit=5")
    assert response.status_code == 200
    messages = response.json()
    assert isinstance(messages, list)
    assert len(messages) > 0
    first_msg = messages[0]
    assert "entry_id" in first_msg
    assert "subject" in first_msg
    assert "sender_name" in first_msg
    assert "sender_email" in first_msg
    assert "unread" in first_msg

def test_get_outlook_calendar():
    """Verify Outlook calendar endpoint returns scheduled events for today and future days."""
    # 1. Default today query
    response = client.get("/api/outlook/calendar")
    assert response.status_code == 200
    events = response.json()
    assert isinstance(events, list)
    assert len(events) > 0
    first_event = events[0]
    assert "entry_id" in first_event
    assert "subject" in first_event
    assert "duration_minutes" in first_event
    assert "end_time" in first_event

    # 2. Multi-day range query (e.g. 5 upcoming workdays for planning ahead)
    res_multiday = client.get("/api/outlook/calendar?days=5")
    assert res_multiday.status_code == 200
    events_multiday = res_multiday.json()
    assert len(events_multiday) >= len(events)

    # 3. Specific future date query
    res_future = client.get("/api/outlook/calendar?start_date=2026-10-01&days=3")
    assert res_future.status_code == 200
    events_future = res_future.json()
    assert isinstance(events_future, list)
    assert len(events_future) > 0

    # 4. Invalid date format returns 400 Bad Request
    res_bad = client.get("/api/outlook/calendar?start_date=not-a-date")
    assert res_bad.status_code == 400
    assert "Invalid date format" in res_bad.json()["detail"]


def test_bulk_archive_and_restore_cycle():
    """Verify bulk archiving and undo/restore endpoints work with EntryIDs."""
    test_ids = ["msg-test-1", "msg-test-2", "msg-test-3"]

    # 1. Archive
    archive_res = client.post("/api/outlook/archive", json={"entry_ids": test_ids})
    assert archive_res.status_code == 200
    archive_data = archive_res.json()
    assert archive_data["success"] is True
    assert archive_data["archived_count"] == 3
    assert archive_data["archived_ids"] == test_ids

    # 2. Restore (Undo / Revert)
    restore_res = client.post("/api/outlook/restore", json={"entry_ids": test_ids})
    assert restore_res.status_code == 200
    restore_data = restore_res.json()
    assert restore_data["success"] is True
    assert restore_data["restored_count"] == 3
    assert restore_data["restored_ids"] == test_ids

def test_openapi_documentation_available():
    """Verify OpenAPI schema and Swagger docs are generated."""
    res_schema = client.get("/openapi.json")
    assert res_schema.status_code == 200
    schema = res_schema.json()
    assert schema["info"]["title"] == "AuraWork AI Dashboard & Outlook MAPI Service"
    assert "/api/outlook/inbox" in schema["paths"]
    assert "/api/outlook/archive" in schema["paths"]
    assert "/api/outlook/restore" in schema["paths"]
    assert "/api/outlook/calendar" in schema["paths"]

def test_static_frontend_served():
    """Verify root / serves HTML dashboard."""
    response = client.get("/")
    assert response.status_code == 200
    assert "AuraWork" in response.text
