# FamilyFlow API Documentation

Base URL: `http://localhost:3001`

## State

### GET /api/state
Returns the full application state.

### POST /api/state
Update application state.

## AI / Gemini

### POST /api/gemini/chat
Send a chat message to the AI assistant.

Request body:
```json
{
  "prompt": "Minha mensagem",
  "chatHistory": []
}
```

### GET /api/gemini/mode
Get current AI mode.

Response:
```json
{
  "mode": "familia"
}
```

### POST /api/gemini/mode
Set AI mode.

Request body:
```json
{
  "mode": "correria"
}
```

Modes: `correria`, `foco`, `familia`

### POST /api/gemini/chat/stream
Streaming chat response (SSE).

### POST /api/gemini/reorganize
Reorganize task schedule by priority.

### POST /api/gemini/analyze-workload
Analyze workload distribution between family members.

### POST /api/gemini/weekly-meeting
Generate weekly meeting summary.

## Gamification

### GET /api/gamification/leaderboard
Get points leaderboard sorted by score.

Response:
```json
{
  "leaderboard": [
    { "name": "João", "points": 1250, "level": 5, "streak": 12 },
    { "name": "Maria", "points": 980, "level": 4, "streak": 8 }
  ]
}
```

### GET /api/gamification/achievements/:userId
Get user achievements and badges.

## Health

### GET /health
Health check endpoint.

Response:
```json
{
  "status": "healthy",
  "uptime": 3600,
  "memory": { "used": 52428800, "total": 104857600, "percentage": 50 },
  "services": { "api": true, "gemini": true, "memory": true }
}
```

### GET /api/metrics
Get recorded monitoring metrics.

## Authentication

### POST /auth/register
Register a new user.

### POST /auth/login
Login with email.

### POST /auth/firebase
Authenticate with Firebase ID token.

## Tasks

### GET /api/tasks
List all tasks.

### POST /api/task
Create a new task.

### DELETE /api/task/:id
Remove a task.

## Goals

### POST /api/goal
Create a new goal.

## Habits

### POST /api/habit/toggle
Toggle habit completion for a date.

### DELETE /api/habit/:id
Remove a habit.

## Shopping

### POST /api/shopping
Create or update a shopping item.

### DELETE /api/shopping/:id
Remove a shopping item.

## Calendar

### POST /api/calendar
Create a calendar event.

## Notifications

### POST /api/notifications/read
Mark notifications as read.

## Chat

### POST /api/chat/group
Send a group chat message.
