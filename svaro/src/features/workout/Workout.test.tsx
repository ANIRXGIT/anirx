import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Workout from './Workout';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAppStore } from '../../stores/useAppStore';
import { localRepo } from '../../db/repositories/LocalRepository';

vi.mock('../../stores/useAuthStore', () => ({
  useAuthStore: vi.fn()
}));

vi.mock('../../stores/useAppStore', () => ({
  useAppStore: vi.fn()
}));

vi.mock('../../db/repositories/LocalRepository', () => ({
  localRepo: {
    getActiveWorkoutTemplates: vi.fn(),
    getExercises: vi.fn(),
    saveWorkoutTemplate: vi.fn(),
    saveExercise: vi.fn(),
    getTodayWorkoutSession: vi.fn(),
    getSessionSets: vi.fn(),
    saveWorkoutSession: vi.fn(),
    saveSetLog: vi.fn(),
    getWorkoutSessions: vi.fn()
  }
}));

describe('Workout Component Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({ user: { id: 'test-user-123' } } as any);
    vi.mocked(useAppStore).mockReturnValue({ profile: { trainingDays: 3 } } as any);
    
    vi.mocked(localRepo.getActiveWorkoutTemplates).mockResolvedValue([]);
    vi.mocked(localRepo.getExercises).mockResolvedValue([]);
    vi.mocked(localRepo.getTodayWorkoutSession).mockResolvedValue(undefined);
    vi.mocked(localRepo.getSessionSets).mockResolvedValue([]);
    vi.mocked(localRepo.getWorkoutSessions).mockResolvedValue([]);
  });

  it('generates and autosaves default templates when none exist', async () => {
    render(<Workout />);
    
    fireEvent.click(screen.getByText('PLAN'));
    
    await waitFor(() => {
      expect(localRepo.getActiveWorkoutTemplates).toHaveBeenCalled();
    });

    expect(localRepo.saveWorkoutTemplate).toHaveBeenCalledTimes(3);
  });
});

