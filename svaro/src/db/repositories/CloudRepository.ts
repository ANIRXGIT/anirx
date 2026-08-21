import { supabase } from '../../lib/supabase';
import type { Exercise, Food, WorkoutTemplate } from '../dexie';

export class CloudRepository {
  async getExercises(): Promise<Exercise[]> {
    const { data, error } = await supabase.from('exercises').select('*');
    if (error) throw error;
    return data || [];
  }

  async saveExercise(exercise: Exercise): Promise<void> {
    const { error } = await supabase.from('exercises').upsert({
      ...exercise,
      owner_id: (await supabase.auth.getUser()).data.user?.id
    });
    if (error) throw error;
  }

  async getFoods(): Promise<Food[]> {
    const { data, error } = await supabase.from('foods').select('*');
    if (error) throw error;
    return data || [];
  }

  async saveFood(food: Food): Promise<void> {
    const { error } = await supabase.from('foods').upsert({
      ...food,
      owner_id: (await supabase.auth.getUser()).data.user?.id
    });
    if (error) throw error;
  }

  async getWorkoutTemplates(): Promise<WorkoutTemplate[]> {
    const { data, error } = await supabase.from('workout_templates').select('*');
    if (error) throw error;
    return data || [];
  }

  async saveWorkoutTemplate(template: WorkoutTemplate): Promise<void> {
    const { error } = await supabase.from('workout_templates').upsert({
      ...template,
      owner_id: (await supabase.auth.getUser()).data.user?.id
    });
    if (error) throw error;
  }

  async getChallengeTemplates(): Promise<any[]> {
    const { data, error } = await supabase.from('challenge_templates').select('*');
    if (error) throw error;
    return data || [];
  }

  async saveChallengeTemplate(template: any): Promise<void> {
    const { error } = await supabase.from('challenge_templates').upsert({
      ...template,
      owner_id: (await supabase.auth.getUser()).data.user?.id
    });
    if (error) throw error;
  }

  async getTaskTemplates(): Promise<any[]> {
    const { data, error } = await supabase.from('task_templates').select('*');
    if (error) throw error;
    return data || [];
  }

  async saveTaskTemplate(template: any): Promise<void> {
    const { error } = await supabase.from('task_templates').upsert({
      ...template,
      owner_id: (await supabase.auth.getUser()).data.user?.id
    });
    if (error) throw error;
  }

  async getSupplementTemplates(): Promise<any[]> {
    const { data, error } = await supabase.from('supplement_templates').select('*');
    if (error) throw error;
    return data || [];
  }

  async saveSupplementTemplate(template: any): Promise<void> {
    const { error } = await supabase.from('supplement_templates').upsert({
      ...template,
      owner_id: (await supabase.auth.getUser()).data.user?.id
    });
    if (error) throw error;
  }

  // Backup & Restore
  async createBackup(payload: string): Promise<void> {
    const { error } = await supabase.from('cloud_backups').insert({
      id: crypto.randomUUID(),
      owner_id: (await supabase.auth.getUser()).data.user?.id,
      timestamp: Date.now(),
      payload: JSON.parse(payload),
      device_info: navigator.userAgent
    });
    if (error) throw error;
  }

  async getBackups(): Promise<any[]> {
    const { data, error } = await supabase.from('cloud_backups')
      .select('id, timestamp, device_info')
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getBackupPayload(id: string): Promise<any> {
    const { data, error } = await supabase.from('cloud_backups').select('payload').eq('id', id).single();
    if (error) throw error;
    return data?.payload;
  }

  // Skincare Management
  async getSkincareProducts(): Promise<any[]> {
    const { data, error } = await supabase.from('skincare_products').select('*');
    if (error) throw error;
    return data || [];
  }

  async saveSkincareProduct(product: any): Promise<void> {
    const { error } = await supabase.from('skincare_products').upsert({
      ...product,
      owner_id: (await supabase.auth.getUser()).data.user?.id
    });
    if (error) throw error;
  }

  async logSkincareRoutine(routine: any): Promise<void> {
    const { error } = await supabase.from('skincare_routines').insert({
      ...routine,
      owner_id: (await supabase.auth.getUser()).data.user?.id
    });
    if (error) throw error;
  }
}

export const cloudRepo = new CloudRepository();
