"""
Manual Verification Test Script for Live Outlook MAPI & AI Summarization.

Run this script manually on your production Windows workstation when Outlook is open:
    uv run python scripts/manual_test_live_outlook.py

This script:
1. Tests COM connection to the live Outlook desktop client.
2. Benchmarks the fast-fetch speed of inbox messages (Subject/Headers only).
3. Fetches the full body of a single selected email on-demand via EntryID.
4. Performs an AI summarization round-trip and saves the result to local aurawork.db.
"""

import sys
import time
from datetime import datetime

def main():
    print("=" * 65)
    print("  AuraWork AI — Live Outlook & AI Summarization Manual Test")
    print("=" * 65)

    if sys.platform != "win32":
        print("[!] This script requires Windows with Outlook installed.")
        return

    from outlook_mapi_service import OutlookMapiService, HAS_WIN32COM
    import database as db
    from server import extract_email_ai_insights

    if not HAS_WIN32COM:
        print("[!] pywin32 COM automation is not installed on this environment.")
        return

    # 1. Initialize MAPI service in live mode
    service = OutlookMapiService(mode="live")
    conn_info = service.check_connection()
    print(f"[*] Checking Outlook connection...")
    print(f"    - Status: {'CONNECTED' if conn_info['connected'] else 'FAILED'}")
    print(f"    - Account: {conn_info.get('account_name')}")
    if conn_info.get("error"):
        print(f"    - Error: {conn_info['error']}")
        print("\nEnsure the Outlook desktop application is running and logged in.")
        return

    # 2. Benchmark Fast Fetch (Subject + Headers only)
    print("\n[*] Benchmarking fast inbox fetch (limit=25, headers-only, no body)...")
    start_time = time.perf_counter()
    try:
        messages = service.get_inbox_messages(limit=25)
        elapsed = time.perf_counter() - start_time
        print(f"    ✓ Fetched {len(messages)} messages in {elapsed:.3f} seconds!")
        if messages:
            print(f"    - Sample Subject: {messages[0]['subject']}")
            print(f"    - Sample Sender:  {messages[0]['sender_name']}")
    except Exception as e:
        print(f"    [!] Error during fast inbox fetch: {e}")
        return

    if not messages:
        print("\n[i] Inbox is empty. Nothing to test summarization on.")
        return

    # 3. Test on-demand body loading for 1 email
    target_msg = messages[0]
    entry_id = target_msg["entry_id"]
    print(f"\n[*] Testing on-demand body fetch for email: '{target_msg['subject'][:40]}'")
    try:
        start_detail = time.perf_counter()
        detail = service.get_email_detail(entry_id)
        detail_elapsed = time.perf_counter() - start_detail
        body_preview = (detail.get("body") or "")[:120].replace("\r\n", " ").replace("\n", " ")
        print(f"    ✓ Body fetched in {detail_elapsed:.3f}s: '{body_preview}...'")
    except Exception as e:
        print(f"    [!] Error loading email body: {e}")
        return

    # 4. Run AI Summarization Round-Trip
    print(f"\n[*] Generating AI Summary and Action Items...")
    insights = extract_email_ai_insights(
        subject=detail["subject"],
        sender=detail["sender_name"],
        body=detail.get("body", "")
    )
    print(f"    - Urgency:          {insights['urgency'].upper()}")
    print(f"    - Suggested Task:   {insights['suggested_task']}")
    print(f"    - Suggested Time:   {insights['suggested_duration']} mins")
    print(f"    - Action Items:     {insights['action_items']}")
    print(f"    - Executive Summary: {insights['summary']}")

    # 5. Persist into SQLite aurawork.db
    print(f"\n[*] Persisting AI summary into local SQLite database (aurawork.db)...")
    saved = db.save_email_summary({
        "entry_id": entry_id,
        "subject": detail["subject"],
        "sender": detail["sender_name"],
        "received_time": detail.get("received_time") or datetime.now().isoformat(),
        "summary": insights["summary"],
        "action_items": insights["action_items"],
        "suggested_task": insights["suggested_task"],
        "suggested_duration": insights["suggested_duration"],
        "urgency": insights["urgency"]
    })
    print(f"    ✓ Saved successfully. Verifying SQLite retrieval...")
    verified = db.get_email_summary(entry_id)
    assert verified is not None, "Failed to read back summary from SQLite!"
    print(f"    ✓ Read back from DB: entry_id={verified['entry_id']}, task='{verified['suggested_task']}'")

    print("\n" + "=" * 65)
    print("  ✓ ALL LIVE OUTLOOK & AI SUMMARIZATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 65)

if __name__ == "__main__":
    main()
