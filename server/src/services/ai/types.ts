export interface GeneratedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  labels: string[];
  estimatedHours: number;
}

export interface GeneratedSubtask {
  title: string;
}

export interface TaskPriorityRecommendation {
  taskId: string;
  key: string;
  title: string;
  currentPriority: string;
  suggestedPriority: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 1 to 100
  rationale: string;
  urgencyLevel: 'high' | 'medium' | 'low';
}

export interface ProjectSummaryReport {
  executiveSummary: string;
  progressRate: number;
  completedHighlights: string[];
  inProgressHighlights: string[];
  blockersAndRisks: string[];
  overdueItems: string[];
  recommendations: string[];
}

export interface ProductivityInsightItem {
  type: 'warning' | 'positive' | 'tip' | 'workload';
  title: string;
  message: string;
  metric?: string;
}

export interface AIEngineProvider {
  name: string;
  generateTasks(goal: string, context?: string): Promise<GeneratedTask[]>;
  generateSubtasks(taskTitle: string, taskDescription?: string): Promise<GeneratedSubtask[]>;
  prioritizeTasks(projectData: any, tasks: any[]): Promise<TaskPriorityRecommendation[]>;
  summarizeProject(project: any, tasks: any[]): Promise<ProjectSummaryReport>;
  generateInsights(analyticsData: any): Promise<ProductivityInsightItem[]>;
}
