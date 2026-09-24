"""
Outlook MAPI service module.
Communicates directly with the local Windows Outlook desktop application
via COM automation (win32com.client).
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, date
import sys

# Flag indicating whether pywin32 is importable on this machine
HAS_WIN32COM = False
try:
    if sys.platform == "win32":
        import win32com.client
        HAS_WIN32COM = True
except Exception:
    HAS_WIN32COM = False


class OutlookMapiService:
    """
    Service wrapper for Outlook MAPI / COM automation.
    Supports reading inbox emails, calendar events, bulk archiving,
    and undo/revert by moving items between Outlook folders.
    """

    # Well-known Outlook MAPI folder IDs (OlDefaultFolders enumeration)
    OL_FOLDER_DELETED = 3
    OL_FOLDER_OUTBOX = 4
    OL_FOLDER_SENT = 5
    OL_FOLDER_INBOX = 6
    OL_FOLDER_CALENDAR = 9
    OL_FOLDER_CONTACTS = 10
    OL_FOLDER_ARCHIVE = 100  # Fallback custom search if not default

    def __init__(self, use_mock_fallback: bool = True):
        self.use_mock_fallback = use_mock_fallback
        self._outlook = None
        self._namespace = None
        self._mock_calendar_cleared = False

    def clear_mock_calendar(self):
        """Clears mock calendar events when cleaning prototype data."""
        self._mock_calendar_cleared = True

    def reset_mock_calendar(self):
        """Restores mock calendar events when loading demo data."""
        self._mock_calendar_cleared = False

    def _get_namespace(self):
        """Initializes and returns the MAPI namespace."""
        if not HAS_WIN32COM:
            return None
        if self._namespace is None:
            try:
                self._outlook = win32com.client.Dispatch("Outlook.Application")
                self._namespace = self._outlook.GetNamespace("MAPI")
            except Exception as e:
                if not self.use_mock_fallback:
                    raise RuntimeError(f"Failed to connect to local Outlook via MAPI: {e}")
                return None
        return self._namespace

    def get_inbox_messages(self, limit: int = 50, unread_only: bool = False) -> List[Dict[str, Any]]:
        """
        Retrieves recent emails from the Outlook Inbox.
        """
        ns = self._get_namespace()
        if ns is None:
            return self._mock_inbox_messages()

        try:
            inbox = ns.GetDefaultFolder(self.OL_FOLDER_INBOX)
            messages = inbox.Items
            messages.Sort("[ReceivedTime]", True)  # Sort descending

            results = []
            count = 0
            for msg in messages:
                if count >= limit:
                    break
                try:
                    if unread_only and not msg.UnRead:
                        continue

                    # Extract properties safely
                    entry_id = getattr(msg, "EntryID", f"mock-{count}")
                    subject = getattr(msg, "Subject", "(No Subject)")
                    sender = getattr(msg, "SenderName", "")
                    sender_email = getattr(msg, "SenderEmailAddress", "")
                    received_time = getattr(msg, "ReceivedTime", None)
                    body_snippet = (getattr(msg, "Body", "") or "")[:200].replace("\r\n", " ").strip()

                    results.append({
                        "entry_id": entry_id,
                        "subject": subject,
                        "sender_name": sender,
                        "sender_email": sender_email,
                        "received_time": str(received_time) if received_time else "",
                        "unread": bool(getattr(msg, "UnRead", False)),
                        "body_snippet": body_snippet
                    })
                    count += 1
                except Exception:
                    continue

            return results
        except Exception as e:
            if self.use_mock_fallback:
                return self._mock_inbox_messages()
            raise RuntimeError(f"Error accessing Outlook inbox: {e}")

    def get_calendar_events(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        days: int = 1
    ) -> List[Dict[str, Any]]:
        """
        Retrieves meetings and events from Outlook Calendar for a given date range.
        If start_date is not provided, defaults to today.
        If end_date is not provided, calculates end_date based on start_date + (days - 1).
        """
        from datetime import timedelta

        if start_date is None:
            start_date = date.today()

        if end_date is None:
            days = max(1, days)
            end_date = start_date + timedelta(days=days - 1)

        ns = self._get_namespace()
        if ns is None:
            return self._mock_calendar_events(start_date, end_date)

        try:
            calendar = ns.GetDefaultFolder(self.OL_FOLDER_CALENDAR)
            items = calendar.Items
            items.IncludeRecurrences = True
            items.Sort("[Start]")

            start_str = start_date.strftime("%m/%d/%Y 00:00 AM")
            end_str = end_date.strftime("%m/%d/%Y 11:59 PM")
            filter_query = f"[Start] >= '{start_str}' AND [End] <= '{end_str}'"
            restricted_items = items.Restrict(filter_query)

            events = []
            for item in restricted_items:
                try:
                    subject = getattr(item, "Subject", "Meeting")
                    start_time = getattr(item, "Start", None)
                    end_time = getattr(item, "End", None)
                    duration = getattr(item, "Duration", 30)
                    location = getattr(item, "Location", "")
                    is_meeting = bool(getattr(item, "MeetingStatus", 0) > 0)

                    events.append({
                        "entry_id": getattr(item, "EntryID", ""),
                        "subject": subject,
                        "start_time": str(start_time),
                        "end_time": str(end_time) if end_time else "",
                        "duration_minutes": duration,
                        "location": location,
                        "is_meeting": is_meeting
                    })
                except Exception:
                    continue

            return events
        except Exception as e:
            if self.use_mock_fallback:
                return self._mock_calendar_events(start_date, end_date)
            raise RuntimeError(f"Error accessing Outlook calendar: {e}")

    def archive_messages(self, entry_ids: List[str]) -> Dict[str, Any]:
        """
        Moves a batch of emails from Inbox into the Archive folder via MAPI.
        Returns the list of successfully moved entry_ids.
        """
        ns = self._get_namespace()
        if ns is None:
            return {
                "success": True,
                "archived_count": len(entry_ids),
                "archived_ids": entry_ids,
                "target_folder": "Archive",
                "mock_mode": True
            }

        try:
            inbox = ns.GetDefaultFolder(self.OL_FOLDER_INBOX)
            # Find or fallback to Archive folder
            archive_folder = None
            try:
                # Try getting well-known archive or top-level 'Archive' folder
                archive_folder = inbox.Parent.Folders("Archive")
            except Exception:
                try:
                    archive_folder = inbox.Folders("Archive")
                except Exception:
                    pass

            # If no Archive folder exists, fallback to Deleted Items
            if archive_folder is None:
                archive_folder = ns.GetDefaultFolder(self.OL_FOLDER_DELETED)

            moved_ids = []
            for entry_id in entry_ids:
                try:
                    item = ns.GetItemFromID(entry_id)
                    if item:
                        item.Move(archive_folder)
                        moved_ids.append(entry_id)
                except Exception:
                    continue

            return {
                "success": True,
                "archived_count": len(moved_ids),
                "archived_ids": moved_ids,
                "target_folder": archive_folder.Name,
                "mock_mode": False
            }
        except Exception as e:
            raise RuntimeError(f"Error archiving Outlook messages: {e}")

    def restore_messages_to_inbox(self, entry_ids: List[str]) -> Dict[str, Any]:
        """
        Moves previously archived messages back to the Inbox (Undo / Revert).
        """
        ns = self._get_namespace()
        if ns is None:
            return {
                "success": True,
                "restored_count": len(entry_ids),
                "restored_ids": entry_ids,
                "target_folder": "Inbox",
                "mock_mode": True
            }

        try:
            inbox = ns.GetDefaultFolder(self.OL_FOLDER_INBOX)
            restored_ids = []
            for entry_id in entry_ids:
                try:
                    item = ns.GetItemFromID(entry_id)
                    if item:
                        item.Move(inbox)
                        restored_ids.append(entry_id)
                except Exception:
                    continue

            return {
                "success": True,
                "restored_count": len(restored_ids),
                "restored_ids": restored_ids,
                "target_folder": "Inbox",
                "mock_mode": False
            }
        except Exception as e:
            raise RuntimeError(f"Error restoring Outlook messages: {e}")

    # Fallbacks for dev machines where Outlook desktop is not running
    def _mock_inbox_messages(self) -> List[Dict[str, Any]]:
        return [
            {
                "entry_id": "msg-mock-1",
                "subject": "Customer Escalation: Acme Corp API rate limiting spike",
                "sender_name": "Elena Rostova",
                "sender_email": "elena.rostova@company.com",
                "received_time": datetime.now().isoformat(),
                "unread": True,
                "body_snippet": "Acme Corp hit sudden 429 errors after the deploy this morning. They are requesting an incident review or temporary rate limit bump by 3pm."
            },
            {
                "entry_id": "msg-mock-2",
                "subject": "Action requested: Confirm revised contractor budget by 4pm",
                "sender_name": "Marcus Vance",
                "sender_email": "marcus.vance@company.com",
                "received_time": datetime.now().isoformat(),
                "unread": True,
                "body_snippet": "We need your final headcount and external contractor allocations for next quarter to close the forecast today."
            },
            {
                "entry_id": "msg-mock-3",
                "subject": "Accepted: Product Roadmap Alignment",
                "sender_name": "Sarah Jenkins",
                "sender_email": "sarah.jenkins@company.com",
                "received_time": datetime.now().isoformat(),
                "unread": False,
                "body_snippet": "Sarah Jenkins has accepted your invitation."
            }
        ]

    def _mock_calendar_events(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        if self._mock_calendar_cleared:
            return []
        from datetime import timedelta
        base_date = start_date or date.today()

        # Day 1 (Today / Start Date)
        d1_str = base_date.strftime("%Y-%m-%d")
        # Day 2 (Tomorrow / Next Workday)
        d2 = base_date + timedelta(days=1)
        d2_str = d2.strftime("%Y-%m-%d")
        # Day 3 (+2 days)
        d3 = base_date + timedelta(days=2)
        d3_str = d3.strftime("%Y-%m-%d")

        return [
            {
                "entry_id": "cal-mock-1",
                "subject": "Daily Engineering & Product Standup",
                "start_time": f"{d1_str} 09:00:00",
                "end_time": f"{d1_str} 09:30:00",
                "duration_minutes": 30,
                "location": "Google Meet",
                "is_meeting": True
            },
            {
                "entry_id": "cal-mock-2",
                "subject": "Hiring Interview: Staff Frontend Engineer",
                "start_time": f"{d1_str} 09:30:00",
                "end_time": f"{d1_str} 10:15:00",
                "duration_minutes": 45,
                "location": "Meet room 4",
                "is_meeting": True
            },
            {
                "entry_id": "cal-mock-3",
                "subject": "Q4 Roadmap Strategy Alignment Sync",
                "start_time": f"{d1_str} 15:30:00",
                "end_time": f"{d1_str} 16:30:00",
                "duration_minutes": 60,
                "location": "Executive Conf Room B",
                "is_meeting": True
            },
            {
                "entry_id": "cal-mock-4",
                "subject": "Sprint Planning & Backlog Grooming",
                "start_time": f"{d2_str} 10:00:00",
                "end_time": f"{d2_str} 11:30:00",
                "duration_minutes": 90,
                "location": "Zoom / Room 2",
                "is_meeting": True
            },
            {
                "entry_id": "cal-mock-5",
                "subject": "Customer Advisory Board Sync (Cohort 3)",
                "start_time": f"{d3_str} 14:00:00",
                "end_time": f"{d3_str} 15:00:00",
                "duration_minutes": 60,
                "location": "Google Meet",
                "is_meeting": True
            }
        ]

