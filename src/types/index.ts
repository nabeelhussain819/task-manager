export interface User {
  id: string;
  username: string;
}

export interface ChecklistItem {
  text: string;
  completed: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  checklist: ChecklistItem[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}