import { AIEngineProvider } from './types.js';
import { HeuristicProvider } from './heuristicProvider.js';
import { GeminiProvider } from './geminiProvider.js';

class AIService {
  private primaryProvider: AIEngineProvider;
  private fallbackProvider: AIEngineProvider;

  constructor() {
    this.fallbackProvider = new HeuristicProvider();

    const providerType = process.env.AI_PROVIDER || 'gemini';
    const geminiKey = process.env.GEMINI_API_KEY;

    if (providerType === 'gemini' && geminiKey) {
      this.primaryProvider = new GeminiProvider(geminiKey);
    } else {
      // Default to robust heuristic provider
      this.primaryProvider = this.fallbackProvider;
    }
  }

  public getActiveProviderName(): string {
    return this.primaryProvider.name;
  }

  public async generateTasks(goal: string, context?: string) {
    try {
      const tasks = await this.primaryProvider.generateTasks(goal, context);
      return { tasks, engine: this.primaryProvider.name };
    } catch (error) {
      console.warn(`[AI Service] Primary provider ${this.primaryProvider.name} failed, activating fallback:`, error);
      const tasks = await this.fallbackProvider.generateTasks(goal, context);
      return { tasks, engine: this.fallbackProvider.name, fallbackActivated: true };
    }
  }

  public async generateSubtasks(taskTitle: string, taskDescription?: string) {
    try {
      const subtasks = await this.primaryProvider.generateSubtasks(taskTitle, taskDescription);
      return { subtasks, engine: this.primaryProvider.name };
    } catch (error) {
      console.warn(`[AI Service] Primary provider failed, activating fallback:`, error);
      const subtasks = await this.fallbackProvider.generateSubtasks(taskTitle, taskDescription);
      return { subtasks, engine: this.fallbackProvider.name, fallbackActivated: true };
    }
  }

  public async prioritizeTasks(projectData: any, tasks: any[]) {
    try {
      const recommendations = await this.primaryProvider.prioritizeTasks(projectData, tasks);
      return { recommendations, engine: this.primaryProvider.name };
    } catch (error) {
      console.warn(`[AI Service] Primary provider failed, activating fallback:`, error);
      const recommendations = await this.fallbackProvider.prioritizeTasks(projectData, tasks);
      return { recommendations, engine: this.fallbackProvider.name, fallbackActivated: true };
    }
  }

  public async summarizeProject(project: any, tasks: any[]) {
    try {
      const summary = await this.primaryProvider.summarizeProject(project, tasks);
      return { summary, engine: this.primaryProvider.name };
    } catch (error) {
      console.warn(`[AI Service] Primary provider failed, activating fallback:`, error);
      const summary = await this.fallbackProvider.summarizeProject(project, tasks);
      return { summary, engine: this.fallbackProvider.name, fallbackActivated: true };
    }
  }

  public async generateInsights(analyticsData: any) {
    try {
      const insights = await this.primaryProvider.generateInsights(analyticsData);
      return { insights, engine: this.primaryProvider.name };
    } catch (error) {
      console.warn(`[AI Service] Primary provider failed, activating fallback:`, error);
      const insights = await this.fallbackProvider.generateInsights(analyticsData);
      return { insights, engine: this.fallbackProvider.name, fallbackActivated: true };
    }
  }
}

export const aiService = new AIService();
