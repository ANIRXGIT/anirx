
export const APPLICATION_STATUSES = [
  'TARGET',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN'
] as const;

export type ApplicationStatus = typeof APPLICATION_STATUSES[number];

export class CareerEngine {
  /**
   * Deterministically validates if a transition is logically sound,
   * though users can force override if they made a mistake.
   */
  static isValidTransition(current: ApplicationStatus, next: ApplicationStatus): boolean {
    const currentIndex = APPLICATION_STATUSES.indexOf(current);
    const nextIndex = APPLICATION_STATUSES.indexOf(next);
    
    // Can always withdraw or be rejected
    if (next === 'REJECTED' || next === 'WITHDRAWN') return true;
    
    // Can't go backward normally unless correcting a mistake, 
    // but strict forward progression is:
    return nextIndex > currentIndex;
  }
}
