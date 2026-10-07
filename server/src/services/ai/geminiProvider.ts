import {
  AIEngineProvider,
  GeneratedTask,
  GeneratedSubtask,
  TaskPriorityRecommendation,
  ProjectSummaryReport,
  ProductivityInsightItem,
} from './types.js';

export class GeminiProvider implements AIEngineProvider {
  name = 'Google Gemini (gemini-1.5-flash)';
  private apiKey: string;
  private model: string = 'gemini-1.5-flash';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
  }

  private async callGemini(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second safety timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction
            ? { parts: [{ text: systemInstruction }] }
            : undefined,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error [${response.status}]: ${errorText}`);
      }

      const json = await response.json();
      const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('Empty response from Gemini API');
      }

      return content;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async generateTasks(goal: string, context?: string): Promise<GeneratedTask[]> {
    const prompt = `Generate a realistic list of 5-8 structured software engineering tasks for this goal: "${goal}".
Context: ${context || 'Modern full-stack web application'}.
Return a strict JSON array of objects with fields:
- title: string
- description: string
- priority: "low" | "medium" | "high" | "critical"
- labels: string[] (e.g. ["frontend", "backend", "database", "auth", "testing"])
- estimatedHours: number`;

    const raw = await this.callGemini(prompt, 'You are a lead staff software architect producing actionable tasks.');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.tasks || [];
  }

  async generateSubtasks(taskTitle: string, taskDescription?: string): Promise<GeneratedSubtask[]> {
    const prompt = `Generate 4-6 granular, actionable subtasks for task: "${taskTitle}".
Description: "${taskDescription || ''}".
Return a strict JSON array of objects with fields:
- title: string`;

    const raw = await this.callGemini(prompt, 'You are a senior developer breaking down tasks into technical steps.');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.subtasks || [];
  }

  async prioritizeTasks(projectData: any, tasks: any[]): Promise<TaskPriorityRecommendation[]> {
    const prompt = `Analyze and prioritize these software project tasks:
Project: ${JSON.stringify(projectData)}
Tasks: ${JSON.stringify(
      tasks.map((t) => ({
        id: t._id,
        key: t.key,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        hasAssignee: Boolean(t.assignee),
      }))
    )}

Return a strict JSON array of objects sorted by urgency descending:
- taskId: string
- key: string
- title: string
- currentPriority: string
- suggestedPriority: "low" | "medium" | "high" | "critical"
- score: number (1 to 100)
- rationale: string
- urgencyLevel: "high" | "medium" | "low"`;

    const raw = await this.callGemini(prompt, 'You are an engineering sprint manager analyzing team workload.');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.recommendations || [];
  }

  async summarizeProject(project: any, tasks: any[]): Promise<ProjectSummaryReport> {
    const prompt = `Generate an executive progress summary for project:
Project: ${JSON.stringify({ name: project.name, key: project.key, deadline: project.deadline })}
Task Statistics: Total: ${tasks.length}, Done: ${tasks.filter((t) => t.status === 'done').length}, In Progress: ${tasks.filter((t) => t.status === 'in_progress').length}

Return a strict JSON object with fields:
- executiveSummary: string
- progressRate: number (percentage)
- completedHighlights: string[]
- inProgressHighlights: string[]
- blockersAndRisks: string[]
- overdueItems: string[]
- recommendations: string[]`;

    const raw = await this.callGemini(prompt, 'You are a technical director preparing a concise stakeholder report.');
    return JSON.parse(raw);
  }

  async generateInsights(analyticsData: any): Promise<ProductivityInsightItem[]> {
    const prompt = `Analyze this engineering team analytics data and provide 3-5 high-value productivity insights:
Data: ${JSON.stringify(analyticsData)}

Return a strict JSON array of objects with fields:
- type: "warning" | "positive" | "tip" | "workload"
- title: string
- message: string
- metric: string (optional short badge metric)`;

    const raw = await this.callGemini(prompt, 'You are an AI engineering productivity consultant.');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.insights || [];
  }
}
