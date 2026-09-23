"""
AuraWork AI — FastAPI Server & Outlook MAPI Bridge.
Serves both the single-page application frontend and native Outlook MAPI REST endpoints.
Includes automatic OpenAPI documentation at /docs.
"""

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional
import os

from outlook_mapi_service import OutlookMapiService, HAS_WIN32COM

# Application setup with OpenAPI metadata
app = FastAPI(
    title="AuraWork AI Dashboard & Outlook MAPI Service",
    description="Backend API connecting AuraWork dashboard to local Windows Outlook via MAPI (COM). Supports inbox sync, calendar time-blocking, bulk archiving, and undo.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize service
mapi_service = OutlookMapiService(use_mock_fallback=True)

# Pydantic Schemas
class MessageItem(BaseModel):
    entry_id: str = Field(..., description="Unique Outlook MAPI EntryID")
    subject: str = Field(..., description="Email subject line")
    sender_name: str = Field(..., description="Sender display name")
    sender_email: str = Field(..., description="Sender email address")
    received_time: str = Field(..., description="Timestamp message was received")
    unread: bool = Field(..., description="Whether message is unread")
    body_snippet: str = Field(..., description="First 200 characters of message body")

class CalendarEventItem(BaseModel):
    entry_id: str = Field(..., description="Unique Outlook MAPI EntryID")
    subject: str = Field(..., description="Event or meeting subject")
    start_time: str = Field(..., description="Start time string")
    end_time: Optional[str] = Field("", description="End time string")
    duration_minutes: int = Field(..., description="Duration in minutes")
    location: Optional[str] = Field("", description="Meeting room or video link")
    is_meeting: bool = Field(..., description="True if attendees are invited")

class BulkArchiveRequest(BaseModel):
    entry_ids: List[str] = Field(..., min_length=1, description="List of Outlook MAPI EntryIDs to archive")

class BulkArchiveResponse(BaseModel):
    success: bool
    archived_count: int
    archived_ids: List[str]
    target_folder: str
    mock_mode: bool

class RestoreRequest(BaseModel):
    entry_ids: List[str] = Field(..., min_length=1, description="List of Outlook MAPI EntryIDs to restore to Inbox")

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

# API Endpoints
@app.get("/api/health", response_model=SystemHealthResponse, tags=["System"])
def get_system_health():
    """Returns local system info and checks whether pywin32 COM automation is available."""
    import sys
    return {
        "status": "healthy",
        "platform": sys.platform,
        "pywin32_available": HAS_WIN32COM,
        "outlook_connection": "live_mapi" if HAS_WIN32COM else "mock_fallback"
    }

@app.get("/api/outlook/inbox", response_model=List[MessageItem], tags=["Outlook MAPI"])
def get_outlook_inbox(
    limit: int = Query(25, ge=1, le=100, description="Max messages to fetch"),
    unread_only: bool = Query(False, description="Filter for unread messages only")
):
    """
    Reads messages directly from the local Windows Outlook Inbox via MAPI.
    Returns subject, sender, date, unread flag, and snippet.
    """
    try:
        return mapi_service.get_inbox_messages(limit=limit, unread_only=unread_only)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/api/outlook/calendar", response_model=List[CalendarEventItem], tags=["Outlook MAPI"])
def get_outlook_calendar(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD). Defaults to today."),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD). If omitted, calculated from days."),
    days: int = Query(1, ge=1, le=30, description="Number of days to retrieve from start_date (e.g. 5 for a work week)")
):
    """
    Reads scheduled meetings and calendar events from local Outlook Calendar for a given date range.
    Supports planning ahead for tomorrow, the next 5 workdays, or custom date spans.
    """
    from datetime import datetime
    try:
        parsed_start = datetime.strptime(start_date, "%Y-%m-%d").date() if start_date else None
        parsed_end = datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else None
        return mapi_service.get_calendar_events(start_date=parsed_start, end_date=parsed_end, days=days)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid date format (expected YYYY-MM-DD): {ve}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.post("/api/outlook/archive", response_model=BulkArchiveResponse, tags=["Outlook MAPI"])
def bulk_archive_messages(payload: BulkArchiveRequest):
    """
    Archives a list of emails by moving their MAPI EntryIDs from Inbox to the Archive folder.
    Zero data loss: Items can be reverted anytime.
    """
    try:
        result = mapi_service.archive_messages(payload.entry_ids)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.post("/api/outlook/restore", response_model=RestoreResponse, tags=["Outlook MAPI"])
def restore_archived_messages(payload: RestoreRequest):
    """
    Reverts an archive operation by moving the specified EntryIDs back into the Inbox folder.
    """
    try:
        result = mapi_service.restore_messages_to_inbox(payload.entry_ids)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Mount Frontend Static Assets
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Serve specific root files
@app.get("/", include_in_schema=False)
def serve_root():
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

@app.get("/styles.css", include_in_schema=False)
def serve_css():
    return FileResponse(os.path.join(BASE_DIR, "styles.css"), media_type="text/css")

@app.get("/app.js", include_in_schema=False)
def serve_js():
    return FileResponse(os.path.join(BASE_DIR, "app.js"), media_type="application/javascript")

if __name__ == "__main__":
    import uvicorn
    # Start on 0.0.0.0 or 127.0.0.1 port 8000
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
