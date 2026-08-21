export function calculateCurrentStreak(qualifyingDays: string[], todayStr: string, yesterdayStr: string): number {
  const sorted = [...qualifyingDays].sort().reverse();
  
  if (sorted.length === 0) return 0;
  
  // If today isn't qualified, and yesterday isn't qualified, streak is 0
  if (!sorted.includes(todayStr) && !sorted.includes(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  let currentCheckDate = sorted.includes(todayStr) ? new Date(todayStr) : new Date(yesterdayStr);
  
  for (const dateStr of sorted) {
    const d = new Date(dateStr);
    if (d.getTime() === currentCheckDate.getTime()) {
      streak++;
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else if (d.getTime() < currentCheckDate.getTime()) {
      break;
    }
  }
  
  return streak;
}
