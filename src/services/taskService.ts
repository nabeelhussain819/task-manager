import api from './api';
import { Task, ChecklistItem } from '../types';

export interface CreateTaskData {
  title: string;
  description?: string;
  checklist: ChecklistItem[];
}

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks');
    return response.data;
  },

  async createTask(taskData: CreateTaskData): Promise<Task> {
    const response = await api.post<Task>('/tasks', taskData);
    return response.data;
  },

  async updateTask(taskId: string, updateData: Partial<Task>): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${taskId}`, updateData);
    return response.data;
  },

  async updateChecklistItem(
    taskId: string,
    itemIndex: number,
    completed: boolean
  ): Promise<Task> {
    const response = await api.patch<Task>(
      `/tasks/${taskId}/checklist/${itemIndex}`,
      { completed }
    );
    return response.data;
  },

  async deleteTask(taskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}`);
  },

  async getTask(taskId: string): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${taskId}`);
    return response.data;
  },
};