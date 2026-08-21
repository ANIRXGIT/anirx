export function calculateNoFapStreak(startDate: number | undefined, lastResetTime: number | undefined, nowMs: number = Date.now()): { days: number, hours: number } {
  if (!startDate) return { days: 0, hours: 0 };
  
  const effectiveStart = lastResetTime && lastResetTime > startDate ? lastResetTime : startDate;
  
  if (nowMs < effectiveStart) return { days: 0, hours: 0 };
  
  const diffMs = nowMs - effectiveStart;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return { days, hours };
}
