export type UserRole = 'admin' | 'project_manager' | 'developer' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  preferences?: {
    theme: 'dark' | 'light' | 'system';
    emailNotifications: boolean;
    inAppNotifications: boolean;
  };
  lastActiveAt?: string;
  createdAt?: string;
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ProjectMember {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
  };
  role: 'manager' | 'contributor' | 'viewer';
}

export interface Project {
  _id: string;
  name: string;
  key: string;
  description?: string;
  organization: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  members: ProjectMember[];
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: string;
  deadline?: string;
  isArchived: boolean;
  taskCounter: number;
  stats?: {
    totalTasks: number;
    doneTasks: number;
    progress: number;
    inProgressTasks?: number;
    overdueTasks?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Task {
  _id: string;
  key: string;
  taskNumber: number;
  project: {
    _id: string;
    name: string;
    key: string;
  } | string;
  organization: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  creator: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  assignee?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
  };
  labels: string[];
  estimatedHours?: number;
  dueDate?: string;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  task: string;
  project: string;
  author: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
  };
  content: string;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Activity {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
  };
  project?: {
    _id: string;
    name: string;
    key: string;
  };
  task?: {
    _id: string;
    title: string;
    key: string;
  };
  action: string;
  entityType: string;
  details: {
    field?: string;
    from?: any;
    to?: any;
    summary: string;
  };
  createdAt: string;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
  };
  members: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
      avatar?: string;
      role: UserRole;
      lastActiveAt?: string;
    };
    role: UserRole;
    joinedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
