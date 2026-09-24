import pytest
from fastapi.testclient import TestClient
from server import app, mapi_service
import database as db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db_before_tests():
    """Ensure clean initial seed data and default mock mode for each test run."""
    db.init_db(force_reset=True)
    mapi_service.set_mode("mock")
    db.set_setting("outlook_mode", "mock")

def test_system_health_with_sqlite():
    """Verify system health reports SQLite active."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database"] == "sqlite3_active"

def test_tasks_crud_sqlite():
    """Verify tasks list, create, patch tier, and delete against SQLite."""
    # List
    list_res = client.get("/api/tasks")
    assert list_res.status_code == 200
    initial_tasks = list_res.json()
    assert len(initial_tasks) == 14

    # Create new task
    new_task = {
        "id": "task-test-sqlite",
        "title": "Build SQLite backend for tasks",
        "duration": 45,
        "priority": "high",
        "tier": "today",
        "category": "Backend",
        "completed": False,
        "scheduled_slot_id": None,
        "source": "manual"
    }
    create_res = client.post("/api/tasks", json=new_task)
    assert create_res.status_code == 201
    assert create_res.json()["title"] == "Build SQLite backend for tasks"

    # Patch / Update tier
    patch_res = client.patch("/api/tasks/task-test-sqlite", json={"tier": "upcoming", "completed": True})
    assert patch_res.status_code == 200
    assert patch_res.json()["tier"] == "upcoming"
    assert patch_res.json()["completed"] is True

    # Delete
    del_res = client.delete("/api/tasks/task-test-sqlite")
    assert del_res.status_code == 200

def test_ai_memory_rules_sqlite():
    """Verify AI clean-up memory rules storage in SQLite."""
    # List rules
    rules_res = client.get("/api/rules")
    assert rules_res.status_code == 200
    rules = rules_res.json()
    assert len(rules) >= 2

    # Add rule
    new_rule = {
        "id": "rule-test-sqlite",
        "rule_type": "sender_domain",
        "pattern_value": "@github.com",
        "label": "Sender: '@github.com'",
        "times_applied": 10
    }
    add_res = client.post("/api/rules", json=new_rule)
    assert add_res.status_code == 201
    assert add_res.json()["label"] == "Sender: '@github.com'"

    # Delete rule
    del_res = client.delete("/api/rules/rule-test-sqlite")
    assert del_res.status_code == 200

def test_followups_sqlite():
    """Verify follow-up radar storage and resolve in SQLite."""
    list_res = client.get("/api/followups")
    assert list_res.status_code == 200
    followups = list_res.json()
    assert len(followups) == 4

    # Create follow-up
    new_follow = {
        "id": "follow-test-sqlite",
        "person": "Chief Architect",
        "topic": "Security review approval",
        "channel": "Slack",
        "sent_date": "Today",
        "expected_date": "Tomorrow",
        "status": "waiting",
        "urgency_text": "Awaiting response"
    }
    create_res = client.post("/api/followups", json=new_follow)
    assert create_res.status_code == 201

    # Resolve
    resolve_res = client.patch("/api/followups/follow-test-sqlite/resolve")
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "resolved"

def test_audit_log_and_revert_sqlite():
    """Verify audit log creation and revert action in SQLite."""
    log_entry = {
        "id": "log-test-revert",
        "timestamp": "Today, 16:00",
        "action_type": "TASK_TIER_MOVE",
        "summary": "Promoted task-5 to today",
        "revertable": True,
        "status": "applied",
        "parameters": {
            "type": "TASK_TIER_MOVE",
            "taskId": "task-5",
            "fromTier": "upcoming",
            "toTier": "today"
        }
    }
    # Log action
    log_res = client.post("/api/audit", json=log_entry)
    assert log_res.status_code == 201

    # Revert action
    revert_res = client.patch("/api/audit/log-test-revert/revert")
    assert revert_res.status_code == 200
    assert revert_res.json()["status"] == "reverted"

    # Verify task tier reverted back to upcoming in SQLite
    task_res = client.get("/api/tasks")
    task_5 = next(t for t in task_res.json() if t["id"] == "task-5")
    assert task_5["tier"] == "upcoming"

def test_outlook_endpoints_with_sqlite():
    """Verify Outlook endpoints remain functional with SQLite."""
    inbox_res = client.get("/api/outlook/inbox?limit=2")
    assert inbox_res.status_code == 200
    cal_res = client.get("/api/outlook/calendar?days=3")
    assert cal_res.status_code == 200

def test_database_backup_and_clean():
    """Verify clean_database wipes data and creates backup file."""
    # Ensure some tasks exist
    client.post("/api/database/reset")
    pre_tasks = client.get("/api/tasks").json()
    assert len(pre_tasks) > 0

    # Execute clean
    clean_res = client.post("/api/database/clean")
    assert clean_res.status_code == 200
    clean_data = clean_res.json()
    assert clean_data["success"] is True
    assert clean_data["backup_created"] is True
    assert clean_data["backup_file"].startswith("aurawork_backup_")

    # Verify tasks are empty
    post_tasks = client.get("/api/tasks").json()
    assert len(post_tasks) == 0

    # Verify mock calendar and inbox are also cleaned
    clean_cal = client.get("/api/outlook/calendar").json()
    assert len(clean_cal) == 0
    clean_inbox = client.get("/api/outlook/inbox").json()
    assert len(clean_inbox) == 0

    # Restore seeds for other tests
    reset_res = client.post("/api/database/reset")
    assert reset_res.status_code == 200
    assert len(client.get("/api/tasks").json()) > 0
    assert len(client.get("/api/outlook/calendar").json()) > 0
    assert len(client.get("/api/outlook/inbox").json()) > 0


def test_outlook_mode_and_live_error_handling():
    """Verify Outlook mode switching, persistence, and live error raising when Outlook is disconnected."""
    # Check default/current mode
    mode_res = client.get("/api/outlook/mode")
    assert mode_res.status_code == 200
    data = mode_res.json()
    assert "mode" in data
    assert "connected" in data

    # Switch to live mode
    set_live = client.post("/api/outlook/mode", json={"mode": "live"})
    assert set_live.status_code == 200
    live_data = set_live.json()
    assert live_data["mode"] == "live"

    # In test environment without Outlook open, live mode endpoints MUST raise 503 instead of falling back
    if not live_data["connected"]:
        inbox_err = client.get("/api/outlook/inbox")
        assert inbox_err.status_code == 503
        cal_err = client.get("/api/outlook/calendar")
        assert cal_err.status_code == 503
        archive_err = client.post("/api/outlook/archive", json={"entry_ids": ["test-id"]})
        assert archive_err.status_code == 503

    # Switch back to mock mode
    set_mock = client.post("/api/outlook/mode", json={"mode": "mock"})
    assert set_mock.status_code == 200
    mock_data = set_mock.json()
    assert mock_data["mode"] == "mock"
    assert mock_data["connected"] is True

    # In mock mode, endpoints succeed without error
    inbox_ok = client.get("/api/outlook/inbox")
    assert inbox_ok.status_code == 200
    cal_ok = client.get("/api/outlook/calendar")
    assert cal_ok.status_code == 200


def test_email_summarization_mock_and_cache():
    """Verify AI email summarization endpoint with mock data and local SQLite caching."""
    # Ensure fresh state
    client.post("/api/database/reset")

    payload = {
        "entry_id": "msg-test-summary-1",
        "subject": "Action requested: Confirm revised contractor budget by 4pm",
        "sender": "Marcus Vance (marcus.vance@company.com)",
        "body": "Please review the attached contractor budget allocations and confirm approval by 4pm.",
        "force_refresh": True
    }

    # 1. First summarization call
    res = client.post("/api/emails/summarize", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["entry_id"] == "msg-test-summary-1"
    assert data["urgency"] in ["urgent", "high", "medium"]
    assert "contractor budget" in data["suggested_task"].lower() or "confirm" in data["suggested_task"].lower()
    assert len(data["action_items"]) > 0
    assert data["suggested_duration"] > 0
    assert len(data["summary"]) > 0

    # 2. Verify it is persisted in aurawork.db
    get_res = client.get("/api/emails/summaries/msg-test-summary-1")
    assert get_res.status_code == 200
    cached = get_res.json()
    assert cached["entry_id"] == "msg-test-summary-1"
    assert cached["suggested_task"] == data["suggested_task"]

    # 3. Verify get all summaries list endpoint
    list_res = client.get("/api/emails/summaries")
    assert list_res.status_code == 200
    all_items = list_res.json()
    assert any(item["entry_id"] == "msg-test-summary-1" for item in all_items)

    # 4. Subsequent call without force_refresh returns cached record
    repeat_res = client.post("/api/emails/summarize", json={"entry_id": "msg-test-summary-1"})
    assert repeat_res.status_code == 200
    assert repeat_res.json()["suggested_task"] == data["suggested_task"]


def test_email_summarization_fetches_body_for_missing_preview(monkeypatch):
    """A placeholder inbox snippet must trigger the on-demand Outlook detail fetch."""
    client.post("/api/database/reset")
    calls = []
    llm_input = {}

    def get_email_detail(entry_id):
        calls.append(entry_id)
        return {
            "subject": "Software F-Systems V4.6.2",
            "sender_name": "Rainer Wingert",
            "received_time": "2026-09-24T10:00:00",
            "body": "Please review the release notes and confirm the upgrade plan.",
        }

    def summarize_with_captured_body(subject, sender, body):
        llm_input.update(subject=subject, sender=sender, body=body)
        return {
            "summary": "Fetched body was summarized.",
            "action_items": ["Review the release notes."],
            "suggested_task": "Review release notes",
            "suggested_duration": 15,
            "urgency": "medium",
        }

    monkeypatch.setattr(mapi_service, "get_email_detail", get_email_detail)
    monkeypatch.setattr("server._extract_email_llm_insights", summarize_with_captured_body)
    response = client.post("/api/emails/summarize", json={
        "entry_id": "msg-missing-preview",
        "subject": "Software F-Systems V4.6.2",
        "sender": "Rainer Wingert",
        "body": "No preview snippet available.",
        "force_refresh": True,
    })

    assert response.status_code == 200
    assert calls == ["msg-missing-preview"]
    assert llm_input["body"] == "Please review the release notes and confirm the upgrade plan."


