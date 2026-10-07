# OpsForge REST API Reference

All requests accept and return JSON payloads. Authenticated routes require an `Authorization: Bearer <token>` header or a valid `token` cookie.

## 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user & default workspace | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | No |
| `POST` | `/api/auth/logout` | Invalidate cookie session | No |
| `GET` | `/api/auth/me` | Return currently authenticated user profile | Yes |
| `PUT` | `/api/auth/profile` | Update profile (name, bio, avatar, prefs) | Yes |
| `POST` | `/api/auth/forgot-password` | Generate password reset token | No |
| `POST` | `/api/auth/reset-password` | Reset password using valid token | No |

## 2. Organization & Members (`/api/organization`)
| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/api/organization` | Get workspace details and member roster | Any |
| `POST` | `/api/organization/members` | Invite/add member to workspace | Admin |
| `PATCH` | `/api/organization/members/:userId` | Update member role | Admin |
| `DELETE` | `/api/organization/members/:userId` | Remove member from workspace | Admin |

## 3. Projects (`/api/projects`)
| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/api/projects` | List projects with completion progress & stats | Any |
| `POST` | `/api/projects` | Create new project with key and owner | Admin, PM |
| `GET` | `/api/projects/:id` | Get project details, members, and metrics | Any |
| `PATCH` | `/api/projects/:id` | Update project details, status, or priority | Admin, PM |
| `DELETE` | `/api/projects/:id` | Archive or delete project | Admin, PM |
| `POST` | `/api/projects/:id/members` | Add member to project | Admin, PM |
| `DELETE` | `/api/projects/:id/members/:userId` | Remove member from project | Admin, PM |

## 4. Tasks & Kanban (`/api/tasks`)
| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/api/tasks/project/:projectId` | List tasks for project with filters | Any |
| `POST` | `/api/tasks` | Create task with sequential key (e.g. OPS-1) | Dev, PM, Admin |
| `GET` | `/api/tasks/:id` | Get task details, subtasks, and comments | Any |
| `PATCH` | `/api/tasks/:id` | Update task details, assignee, due date | Any |
| `PATCH` | `/api/tasks/:id/status` | Move task to new Kanban column & order | Any |
| `DELETE` | `/api/tasks/:id` | Delete task and associated audit records | Any |
| `POST` | `/api/tasks/:id/subtasks` | Add subtask to checklist | Any |
| `PATCH` | `/api/tasks/:id/subtasks/:subtaskId` | Toggle subtask completed status | Any |
| `DELETE` | `/api/tasks/:id/subtasks/:subtaskId` | Remove subtask from task | Any |

## 5. Comments (`/api/comments`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/comments/task/:taskId` | Get discussions for task | Yes |
| `POST` | `/api/comments` | Post a comment | Yes |
| `PATCH` | `/api/comments/:id` | Edit comment (Author only) | Yes |
| `DELETE` | `/api/comments/:id` | Delete comment (Author or Admin) | Yes |

## 6. Notifications & Activities
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/notifications` | Get user notifications & unread count | Yes |
| `PATCH` | `/api/notifications/:id/read` | Mark single notification as read | Yes |
| `POST` | `/api/notifications/mark-all-read` | Mark all notifications as read | Yes |
| `GET` | `/api/activity/project/:projectId` | Recent audit history for project | Yes |
| `GET` | `/api/activity/organization` | Workspace-wide activity ledger | Yes |

## 7. Productivity Analytics (`/api/analytics`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/analytics/dashboard` | Org metrics, velocity trend, team workload | Yes |
| `GET` | `/api/analytics/project/:projectId` | Project burn-up and priority metrics | Yes |

## 8. AI Productivity Assistant (`/api/ai`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/ai/generate-tasks` | Decompose goal into technical tasks | Yes |
| `POST` | `/api/ai/generate-subtasks` | Generate actionable checklist subtasks | Yes |
| `POST` | `/api/ai/prioritize-tasks` | Compute task urgency recommendation matrix | Yes |
| `POST` | `/api/ai/summarize-project` | Generate executive progress and risk report | Yes |
| `POST` | `/api/ai/insights` | Synthesize live productivity observations | Yes |
