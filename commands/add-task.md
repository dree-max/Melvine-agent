---
name: add-task
description: Add a new task or to-do item to Melvine's task list
---

# Add Task Command

Use this command when Melvine wants to quickly add a task to their to-do list.

## Usage

`/add-task [title] [priority] [due-date]`

## Parameters

- **title**: Task name (required)
- **priority**: High, Medium, or Low (optional, defaults to Medium)
- **due-date**: Due date in format YYYY-MM-DD or human format (optional)

## Examples

```
/add-task Complete API documentation high
/add-task Review marketing proposal
/add-task Send invoice medium friday
```

## What to Do

1. Parse the task details from the command
2. Confirm the details with the user before saving
3. Use the structured format:
   ```
   ✓ ADD_TASK: [Task Title]
      Priority: [High/Medium/Low]
      Due: [Date if provided]
      Notes: [If provided]
   ```
4. Ask if they want to add any subtasks
5. Confirm when the task has been added

## Notes

- If title is missing, ask the user what task they want to add
- Default priority is Medium
- Suggest breaking down large tasks into smaller subtasks
