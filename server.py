"""
AuraWork AI — FastAPI Server & Outlook MAPI Bridge with SQLite Storage.
Serves both the single-page application frontend and native REST endpoints.
All tasks, followups, AI clean-up memory rules, and audit logs are backed by SQLite.
"""

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os

from outlook_mapi_service import OutlookMapiService, HAS_WIN32COM
import database as db

# Initialize database on startup
db.init_db()

app = FastAPI(
    title="AuraWork AI Dashboard & Outlook MAPI Service",
    description="Backend API with SQLite storage connecting AuraWork dashboard to local Windows Outlook via MAPI.",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mapi_service = OutlookMapiService(use_mock_fallback=True)

# --- Pydantic Schemas ---
class TaskModel(BaseModel):
    id: str
    title: str
    duration: int = 30
    priority: str = "medium"
    tier: str = "today"
    category: str = "General"
    completed: bool = False
    scheduled_slot_id: Optional[str] = None
    source: str = "manual"

class TaskUpdateModel(BaseModel):
    title: Optional[str] = None
    duration: Optional[int] = None
    priority: Optional[str] = None
    tier: Optional[str] = None
    category: Optional[str] = None
    completed: Optional[bool] = None
    scheduled_slot_id: Optional[str] = None

class RuleModel(BaseModel):
    id: str
    rule_type: str
    pattern_value: str
    label: str
    times_applied: int = 0

class FollowupModel(BaseModel):
    id: str
    person: str
    topic: str
    channel: str = "Outlook Email"
    sent_date: str
    expected_date: str
    status: str = "waiting"
    urgency_text: Optional[str] = ""

class AuditLogEntryModel(BaseModel):
    id: str
    timestamp: str
    action_type: str
    summary: str
    revertable: bool = True
    status: str = "applied"
    parameters: Dict[str, Any]

class MessageItem(BaseModel):
    entry_id: str
    subject: str
    sender_name: str
    sender_email: str
    received_time: str
    unread: bool
    body_snippet: str

class CalendarEventItem(BaseModel):
    entry_id: str
    subject: str
    start_time: str
    end_time: Optional[str] = ""
    duration_minutes: int
    location: Optional[str] = ""
    is_meeting: bool

class BulkArchiveRequest(BaseModel):
    entry_ids: List[str] = Field(..., min_length=1)

class BulkArchiveResponse(BaseModel):
    success: bool
    archived_count: int
    archived_ids: List[str]
    target_folder: str
    mock_mode: bool

class RestoreRequest(BaseModel):
    entry_ids: List[str] = Field(..., min_length=1)

class RestoreResponse(BaseModel):
    success: bool
    restored_count: int
    restored_ids: List[str]
    target_folder: str
    mock_mode: bool

class SystemHealthResponse(BaseModel):
    status: str
    platform: str
    pywin32_available: bool
    outlook_connection: str
    database: str


# --- System Endpoints ---
@app.get("/api/health", response_model=SystemHealthResponse, tags=["System"])
def get_system_health():
    import sys
    return {
        "status": "healthy",
        "platform": sys.platform,
        "pywin32_available": HAS_WIN32COM,
        "outlook_connection": "live_mapi" if HAS_WIN32COM else "mock_fallback",
        "database": "sqlite3_active"
    }

@app.post("/api/database/reset", tags=["System"])
def reset_database():
    """Resets database to initial prototype seeds."""
    db.init_db(force_reset=True)
    return {"success": True, "message": "Database reset to initial demo seeds"}


# --- Tasks Endpoints (SQLite) ---
@app.get("/api/tasks", response_model=List[TaskModel], tags=["Tasks"])
def list_tasks():
    return db.get_all_tasks()

@app.post("/api/tasks", response_model=TaskModel, status_code=status.HTTP_201_CREATED, tags=["Tasks"])
def add_task(task: TaskModel):
    return db.create_task(task.model_dump())

@app.patch("/api/tasks/{task_id}", response_model=TaskModel, tags=["Tasks"])
def update_task_endpoint(task_id: str, updates: TaskUpdateModel):
    data = {k: v for k, v in updates.model_dump().items() if v is not None}
    res = db.update_task(task_id, data)
    if not res:
        raise HTTPException(status_code=404, detail="Task not found")
    return res

@app.delete("/api/tasks/{task_id}", tags=["Tasks"])
def delete_task_endpoint(task_id: str):
    deleted = db.delete_task(task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"success": True, "id": task_id}


# --- AI Memory Rules Endpoints (SQLite) ---
@app.get("/api/rules", response_model=List[RuleModel], tags=["AI Memory"])
def list_rules():
    return db.get_all_rules()

@app.post("/api/rules", response_model=RuleModel, status_code=status.HTTP_201_CREATED, tags=["AI Memory"])
def create_rule(rule: RuleModel):
    return db.add_rule(rule.model_dump())

@app.delete("/api/rules/{rule_id}", tags=["AI Memory"])
def remove_rule(rule_id: str):
    deleted = db.delete_rule(rule_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"success": True, "id": rule_id}


# --- Follow-ups Endpoints (SQLite) ---
@app.get("/api/followups", response_model=List[FollowupModel], tags=["Follow-ups"])
def list_followups():
    return db.get_all_followups()

@app.post("/api/followups", response_model=FollowupModel, status_code=status.HTTP_201_CREATED, tags=["Follow-ups"])
def add_followup(item: FollowupModel):
    return db.create_followup(item.model_dump())

@app.patch("/api/followups/{followup_id}/resolve", response_model=FollowupModel, tags=["Follow-ups"])
def resolve_followup(followup_id: str):
    res = db.update_followup(followup_id, {"status": "resolved", "urgency_text": "Resolved just now"})
    if not res:
        raise HTTPException(status_code=404, detail="Followup not found")
    return res


# --- Audit Log Endpoints (SQLite) ---
@app.get("/api/audit", response_model=List[AuditLogEntryModel], tags=["Audit Log"])
def list_audit_logs():
    return db.get_all_audit_logs()

@app.post("/api/audit", response_model=AuditLogEntryModel, status_code=status.HTTP_201_CREATED, tags=["Audit Log"])
def create_audit_entry(entry: AuditLogEntryModel):
    return db.log_action(entry.model_dump())

@app.patch("/api/audit/{log_id}/revert", tags=["Audit Log"])
def revert_audit_entry(log_id: str):
    """Reverts an action in the database and updates status to 'reverted'."""
    logs = db.get_all_audit_logs()
    target = next((l for l in logs if l["id"] == log_id), None)
    if not target or target["status"] == "reverted":
        raise HTTPException(status_code=400, detail="Invalid log ID or action already reverted")

    params = target["parameters"]

    # Revert database states based on action type
    if params.get("type") == "TASK_TIER_MOVE":
        db.update_task(params["taskId"], {"tier": params["fromTier"]})
    elif params.get("type") == "BATCH_TIER_MOVE":
        for tid in params.get("taskIds", []):
            db.update_task(tid, {"tier": params["fromTier"]})
    elif params.get("type") == "RULE_ADDED":
        db.delete_rule(params["ruleId"])

    db.update_audit_status(log_id, "reverted")
    return {"success": True, "id": log_id, "status": "reverted"}


# --- Outlook MAPI Endpoints ---
@app.get("/api/outlook/inbox", response_model=List[MessageItem], tags=["Outlook MAPI"])
def get_outlook_inbox(
    limit: int = Query(25, ge=1, le=100),
    unread_only: bool = Query(False)
):
    try:
        return mapi_service.get_inbox_messages(limit=limit, unread_only=unread_only)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/outlook/calendar", response_model=List[CalendarEventItem], tags=["Outlook MAPI"])
def get_outlook_calendar(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    days: int = Query(1, ge=1, le=30)
):
    from datetime import datetime
    try:
        parsed_start = datetime.strptime(start_date, "%Y-%m-%d").date() if start_date else None
        parsed_end = datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else None
        return mapi_service.get_calendar_events(start_date=parsed_start, end_date=parsed_end, days=days)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {ve}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/outlook/archive", response_model=BulkArchiveResponse, tags=["Outlook MAPI"])
def bulk_archive_messages(payload: BulkArchiveRequest):
    try:
        return mapi_service.archive_messages(payload.entry_ids)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/outlook/restore", response_model=RestoreResponse, tags=["Outlook MAPI"])
def restore_archived_messages(payload: RestoreRequest):
    try:
        return mapi_service.restore_messages_to_inbox(payload.entry_ids)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Static Frontend Mounting
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app.mount("/js", StaticFiles(directory=os.path.join(BASE_DIR, "js")), name="js")

@app.get("/", include_in_schema=False)
def serve_root():
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

@app.get("/styles.css", include_in_schema=False)
def serve_css():
    return FileResponse(os.path.join(BASE_DIR, "styles.css"), media_type="text/css")

@app.get("/app.js", include_in_schema=False)
def serve_legacy_js():
    # Backwards compatibility fallback pointing to modular entry point
    return FileResponse(os.path.join(BASE_DIR, "js", "app.js"), media_type="application/javascript")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
