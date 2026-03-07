---
name: add-event
description: Add a new calendar event or meeting to Melvine's schedule
---

# Add Event Command

Use this command when Melvine wants to quickly add a calendar event.

## Usage

`/add-event [title] [date] [time]`

## Parameters

- **title**: Event name (required)
- **date**: Date in format YYYY-MM-DD or human format like "tomorrow", "next Monday" (required)
- **time**: Time in format HH:MM or "all day" (required)

## Examples

```
/add-event Team standup tomorrow 9am
/add-event Client meeting 2026-03-15 2pm
/add-event All hands meeting next Friday all day
```

## What to Do

1. Parse the event details from the command
2. Confirm the details with the user before saving
3. Use the structured format:
   ```
   📅 ADD_EVENT: [Event Title]
      Date: [YYYY-MM-DD]
      Time: [HH:MM]
      Location: [Ask if needed]
      Notes: [If provided]
   ```
4. Ask if they want to set any reminders for this event
5. Confirm when the event has been added

## Notes

- If any parameter is missing, ask the user for clarification
- Default reminder time is 15 minutes before the event
- Ask about recurring events (daily, weekly, monthly)
