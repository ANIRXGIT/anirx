import { localRepo } from '../../db/repositories/LocalRepository';

export async function evaluateChallenge(userId: string, challengeId: string) {
  const challenges = await localRepo.getAllChallenges(userId);
  const challenge = challenges.find(c => c.id === challengeId);
  if (!challenge) return;

  const now = Date.now();
  
  if (challenge.status === 'upcoming' && now >= challenge.startDate) {
    challenge.status = 'active';
    await localRepo.saveChallenge(challenge);
  }
  
  if (challenge.status === 'active' && now > challenge.endDate) {
    challenge.status = 'failed'; 
    await localRepo.saveChallenge(challenge);
  }
}

export async function evaluateChallengeRequirements(userId: string, challenge: any, dateStr: string) {
  // Evaluates a specific day's completion of requirements
  const dailyResults = [];
  
  for (const req of challenge.requirements) {
    let completed = false;
    
    if (req.type === 'protein') {
      const logs = await localRepo.getTodayFoodLogs(userId); // Need a specific date query in reality, using today as proxy for now
      const totalProtein = logs.reduce((sum, log) => sum + log.protein, 0);
      completed = totalProtein >= req.target;
    } 
    else if (req.type === 'tasks') {
      const tasks = await localRepo.getTasksForDate(userId, dateStr);
      const completedTasks = tasks.filter(t => t.completed).length;
      completed = completedTasks >= req.target;
    }
    // Handle others (water, steps, workout) similarly
    
    dailyResults.push({ type: req.type, completed });
  }
  
  return dailyResults;
}
