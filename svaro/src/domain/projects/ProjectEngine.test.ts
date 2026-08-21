import { describe, it, expect } from 'vitest';
import { ProjectEngine } from './ProjectEngine';
import type { Project, ProjectMilestone, DailyTask } from '../../db/dexie';

describe('ProjectEngine', () => {
  it('calculates project progress from milestones and tasks', () => {
    const project: Project = { id: 'p1', user_id: 'u1', name: 'App', status: 'ACTIVE', priority: 1, created_at: 0, updated_at: 0, privacy_level: 'PRIVATE', sync_state: 'SYNCED', deleted: false };
    
    const milestones: ProjectMilestone[] = [
      { id: 'm1', user_id: 'u', projectId: 'p1', title: 'M1', completed: true, created_at: 0, updated_at: 0, privacy_level: 'PRIVATE', sync_state: 'SYNCED', deleted: false },
      { id: 'm2', user_id: 'u', projectId: 'p1', title: 'M2', completed: false, created_at: 0, updated_at: 0, privacy_level: 'PRIVATE', sync_state: 'SYNCED', deleted: false },
    ];

    const tasks: DailyTask[] = [
      { id: 't1', user_id: 'u', title: 'T1', category: '', source: 'user', completed: true, status: 'completed', priority: 0, timestamp: 0, linkedEntityId: 'p1', linkedDomain: 'projects', created_at: 0, updated_at: 0, privacy_level: 'PRIVATE', sync_state: 'SYNCED', deleted: false },
    ];

    const stats = ProjectEngine.calculateProgress(project, milestones, tasks);
    
    expect(stats.completedMilestones).toBe(1);
    expect(stats.totalMilestones).toBe(2); // 50% = 0.5 * 0.7 = 0.35
    expect(stats.completedTasks).toBe(1);
    expect(stats.totalTasks).toBe(1); // 100% = 1.0 * 0.3 = 0.30
    
    expect(stats.progressPercentage).toBe(65); // 35 + 30
  });
});
