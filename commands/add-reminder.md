---
name: add-reminder
description: Add a reminder for Melvine
---

# Add Reminder Command

Use this command when Melvine wants to quickly add a reminder.

## Usage

`/remind [time] [message]`

## Parameters

- **time**: When to remind (e.g., "in 30 minutes", "at 5pm", "tomorrow morning")
- **message**: What to remind about (required)

## Examples

```
/remind in 30 minutes to call John
/remind at 5pm to send weekly report
/remind tomorrow 9am about the client meeting
```

## What to Do

1. Parse the reminder details from the command
2. Confirm the details with the user before saving
3. Use the structured format:
   ```
   🔔 ADD_REMINDER: [Reminder Message]
      Time: [When to remind]
      Notes: [If provided]
   ```
4. Confirm when the reminder has been set
5. Explain how they will receive the reminder

## Notes

- Clarify time if ambiguous (e.g., "morning" could be 9am, "evening" could be 6pm)
- Ask about reminder frequency if it should recur
- Consider linking reminders to calendar events
