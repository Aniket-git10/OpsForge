# OpsForge AI Architecture & Intelligence Service

## 1. Overview & Architectural Principles

OpsForge incorporates an AI Assistant built from the ground up for software engineering teams. Rather than a generic unstructured chatbot, OpsForge treats AI as an embedded copilot that performs deterministic, structured workflow operations:
- **Feature & Sprint Decomposition**: Breaks high-level business goals into engineering deliverables with priorities, labels, and hour estimates.
- **Subtask Generation**: Generates architectural checkpoints, implementation tasks, and test verification steps for any task.
- **Risk-Weighted Workload Prioritization**: Computes urgency and priority scores based on deadlines, active work in progress, and unassigned bottlenecks.
- **Executive Project Summaries**: Synthesizes roadmap velocity, risks, blockers, and upcoming milestones.
- **Productivity & Bottleneck Insights**: Observes team velocity, overdue ratios, and workload concentration across developers.

### Core Architectural Guarantees:
1. **Server-Side Isolation**: All AI interactions occur strictly on the backend. No provider API keys or client tokens are ever exposed to the browser.
2. **Provider Agnostic Abstraction Layer**: The core business logic interacts solely with an abstract `IAIProvider` interface, allowing providers to be swapped (e.g., Gemini, OpenAI, Claude, Ollama) with zero controller changes.
3. **Graceful Zero-Downtime Fallback**: If `GEMINI_API_KEY` is omitted, misconfigured, or encounters quota exhaustion, OpsForge seamlessly falls back to a deterministic `HeuristicProvider` powered by statistical MongoDB aggregations and NLP heuristics. The UI **never throws 500 errors** or breaks.

---

## 2. Provider Abstraction Contract (`IAIProvider`)

Located in `server/src/services/ai/types.ts`:

```typescript
export interface IAIProvider {
  generateTasks(prompt: string, context?: ProjectContext): Promise<GeneratedTask[]>;
  generateSubtasks(taskTitle: string, taskDescription?: string): Promise<GeneratedSubtask[]>;
  prioritizeTasks(projectData: ProjectContext, tasks: TaskData[]): Promise<TaskPriorityRecommendation[]>;
  summarizeProject(project: ProjectContext, tasks: TaskData[]): Promise<ProjectSummaryReport>;
  generateInsights(orgStats: OrgStatsData, projects: ProjectContext[]): Promise<ProductivityInsight[]>;
}
```

---

## 3. Supported Providers

### A. Primary Provider: Google Gemini (`GeminiAIProvider`)
- **SDK**: Official `@google/genai` client.
- **Default Model**: `gemini-1.5-flash` for high-throughput, low-latency structured output.
- **Output Enforcement**: Employs strict system instructions requesting valid JSON representations, stripping markdown backticks (` ```json `), and defensively parsing schemas.
- **Configuration**:
  ```env
  GEMINI_API_KEY="your-google-ai-studio-api-key"
  AI_PROVIDER="gemini"
  ```

### B. Fallback Provider: Deterministic Heuristic Engine (`HeuristicAIProvider`)
- **Activation**: Automatically activates if `GEMINI_API_KEY` is not found, or dynamically during Gemini API timeouts/rate-limit exceptions.
- **Task Decomposition Logic**: Matches technical keywords (`auth`, `docker`, `api`, `payment`, `analytics`, `e-commerce`, `mobile`, `cloud`) against curated full-stack architectural blueprints, generating comprehensive task packages.
- **Subtask Logic**: Generates modular checklists encompassing schema modeling, controller handlers, defensive validation, test coverage, and code review steps.
- **Prioritization Scoring**: Computes a continuous mathematical score (1–100) combining:
  - Overdue penalty: `+35` points
  - Approaching deadline (<48h): `+25` points
  - Active work in progress: `+15` points (prevents context switching)
  - Critical priority tag: `+20` points
  - Unassigned high-impact risk: `+10` points
- **Productivity Observations**: Scans live MongoDB query snapshots to detect real workload skews (e.g., single member owning >50% of tasks, projects lagging behind schedule).

---

## 4. Feature Capabilities & Data Contracts

### 1. Goal-to-Tasks Decomposition
- **Endpoint**: `POST /api/ai/generate-tasks`
- **Request Body**:
  ```json
  {
    "prompt": "Build real-time chat with file uploads and end-to-end encryption",
    "projectId": "660c1f2e..."
  }
  ```
- **Response**: Array of structured task blueprints:
  ```json
  {
    "tasks": [
      {
        "title": "Design WebSocket Protocol & Message Schemas",
        "description": "Establish event types for message broadcasting and typing indicators.",
        "priority": "high",
        "estimatedHours": 6,
        "labels": ["backend", "real-time", "architecture"],
        "subtasks": [
          { "title": "Define Socket.IO payload schema" },
          { "title": "Implement room join/leave authorization" }
        ]
      }
    ]
  }
  ```
- **Review Prior to Creation**: The OpsForge UI provides a modal preview table where engineers can adjust titles, toggle selections, and select which items to import directly into the project's Kanban board.

---

### 2. Subtask Breakdown Generator
- **Endpoint**: `POST /api/ai/generate-subtasks`
- **Request Body**:
  ```json
  {
    "taskId": "660c2a1b...",
    "title": "Integrate Stripe Checkout Webhook",
    "description": "Handle invoice.paid and customer.subscription.deleted events idempotently."
  }
  ```
- **Response**: Array of discrete subtask items immediately applicable to the task's checklist.

---

### 3. Workload Prioritization Matrix
- **Endpoint**: `POST /api/ai/prioritize-tasks`
- **Request Body**: `{ "projectId": "660c1f2e..." }`
- **Response**:
  ```json
  {
    "recommendations": [
      {
        "taskId": "660c2b...",
        "key": "OPS-4",
        "title": "Audit Database Indexing & Query Latency",
        "currentPriority": "medium",
        "suggestedPriority": "critical",
        "score": 92,
        "rationale": "Task is overdue by 2 day(s); Work is actively in progress - finish before starting new items",
        "urgencyLevel": "high"
      }
    ]
  }
  ```

---

### 4. Executive Project Summary
- **Endpoint**: `POST /api/ai/project-summary`
- **Request Body**: `{ "projectId": "660c1f2e..." }`
- **Response Structure**:
  - `executiveSummary`: High-level progress paragraph.
  - `completedWork`: Array of key milestones achieved.
  - `currentFocus`: Active sprint work.
  - `blockersAndRisks`: Overdue deadlines and unassigned high-priority work.
  - `nextMilestones`: Upcoming priority targets.
  - `velocityHealth`: `'on_track' | 'at_risk' | 'delayed'` with completion percentage.

---

### 5. Automated Productivity Insights
- **Endpoint**: `GET /api/ai/insights`
- **Response**: Live observations generated from database aggregates:
  - Total tasks, completion velocity, overdue counts.
  - Team workload distribution alerts.
  - Proactive recommendations for project managers.

---

## 5. Security, Privacy & Token Minimization

1. **No Sensitive PII Export**: Prompts sent to LLM providers contain only task metadata (keys, titles, priority, status, deadlines). User passwords, email addresses, and internal system logs are never forwarded.
2. **Strict Schema Constraints**: Prompts require JSON-only responses, preventing prompt injection attacks from altering UI structure.
3. **Rate Limiting**: AI endpoints are protected by dedicated Express rate limiters (`apiLimiter`), preventing abuse and quota depletion.
4. **Offline CI/CD Compatibility**: Tests never depend on live external AI API credentials, ensuring seamless local runs and automated GitHub Actions passes.
