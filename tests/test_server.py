import pytest
from fastapi.testclient import TestClient
from server import app
import database as db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db_before_tests():
    """Ensure clean initial seed data for each test run."""
    db.init_db(force_reset=True)

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
