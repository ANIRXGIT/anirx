import type { Project, ProjectMilestone, DailyTask } from '../../db/dexie';

export interface ProjectStats {
  progressPercentage: number;
  completedTasks: number;
  totalTasks: number;
  completedMilestones: number;
  totalMilestones: number;
}

export class ProjectEngine {
  static calculateProgress(project: Project, milestones: ProjectMilestone[], tasks: DailyTask[]): ProjectStats {
    const pMilestones = milestones.filter(m => m.projectId === project.id);
    const pTasks = tasks.filter(t => t.linkedEntityId === project.id && t.linkedDomain === 'projects');

    const completedTasks = pTasks.filter(t => t.status === 'completed').length;
    const completedMilestones = pMilestones.filter(m => m.completed).length;

    const totalTasks = pTasks.length;
    const totalMilestones = pMilestones.length;

    let percentage = 0;
    
    // Weight milestones heavier than tasks if both exist
    if (totalMilestones > 0 && totalTasks > 0) {
      const milestoneProg = completedMilestones / totalMilestones;
      const taskProg = completedTasks / totalTasks;
      percentage = Math.round((milestoneProg * 0.7 + taskProg * 0.3) * 100);
    } else if (totalMilestones > 0) {
      percentage = Math.round((completedMilestones / totalMilestones) * 100);
    } else if (totalTasks > 0) {
      percentage = Math.round((completedTasks / totalTasks) * 100);
    }

    return {
      progressPercentage: percentage,
      completedTasks,
      totalTasks,
      completedMilestones,
      totalMilestones
    };
  }
}
