import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppStore } from '../../stores/useAppStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

const onboardingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(16, 'Must be at least 16 years old').max(120),
  sex: z.enum(['male', 'female', 'other']),
  heightCm: z.number().min(50).max(300),
  weightKg: z.number().min(20).max(400),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'high', 'very_high']),
  trainingExperience: z.enum(['beginner', 'intermediate', 'advanced']),
  trainingDays: z.number().min(1).max(7),
  goalType: z.enum(['fat_loss', 'muscle_gain', 'recomposition', 'general_fitness', 'strength', 'aesthetic'])
});

type OnboardingData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const { setProfileAndGeneratePlan, loadInitialData } = useAppStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      activityLevel: 'sedentary',
      trainingExperience: 'beginner',
      trainingDays: 3,
      goalType: 'fat_loss',
    }
  });

  const onSubmit = async (data: OnboardingData) => {
    if (!user) {
      console.error("Cannot create profile: User is not authenticated.");
      return;
    }

    const profileId = crypto.randomUUID();
    await setProfileAndGeneratePlan({
      id: profileId,
      user_id: user.id,
      name: data.name,
      age: data.age,
      sex: data.sex,
      heightCm: data.heightCm,
      weightKg: data.weightKg,
      activityLevel: data.activityLevel,
      trainingExperience: data.trainingExperience,
      trainingDays: data.trainingDays,
      gymEquipment: 'full_gym', // Default
      physicalLimitations: [],
      dietaryRestrictions: [],
      transformationDurationDays: 90, // Default
      created_at: Date.now(),
      updated_at: Date.now(),
      privacy_level: 'PRIVATE',
      sync_state: 'PENDING',
      deleted: false
    }, data.goalType);

    await loadInitialData(user.id);
    navigate('/');
  };

  return (
    <div className="min-h-full bg-background text-text p-6 pb-20 overflow-y-auto">
      <div className="max-w-md mx-auto space-y-8">
        <header className="mb-10 mt-16 text-center space-y-2">
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">SVARO</h1>
          <p className="text-xs font-black tracking-widest uppercase text-accent">Initialize Protocol</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="bg-surface p-6 rounded-3xl border border-border space-y-5 shadow-2xl">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Identity</h2>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Name</label>
              <input 
                {...register('name')} 
                className="w-full bg-background border border-border rounded-xl p-4 text-base font-bold focus:outline-none focus:border-accent transition-colors shadow-inner"
                placeholder="Call sign"
              />
              {errors.name && <p className="text-error text-xs font-bold mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Age</label>
                <input 
                  type="number" 
                  {...register('age', { valueAsNumber: true })} 
                  className="w-full bg-background border border-border rounded-xl p-4 text-base font-bold text-center focus:outline-none focus:border-accent transition-colors shadow-inner"
                  placeholder="25"
                />
                {errors.age && <p className="text-error text-xs font-bold mt-1">{errors.age.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Sex</label>
                <select 
                  {...register('sex')} 
                  className="w-full bg-background border border-border rounded-xl p-4 text-base font-bold focus:outline-none focus:border-accent transition-colors shadow-inner appearance-none text-center"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.sex && <p className="text-error text-xs font-bold mt-1">{errors.sex.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-border space-y-5 shadow-2xl">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Current State</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Height (cm)</label>
                <input 
                  type="number" 
                  step="0.1"
                  {...register('heightCm', { valueAsNumber: true })} 
                  className="w-full bg-background border border-border rounded-xl p-4 text-base font-bold text-center focus:outline-none focus:border-accent transition-colors shadow-inner"
                  placeholder="180"
                />
                {errors.heightCm && <p className="text-error text-xs font-bold mt-1">{errors.heightCm.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  {...register('weightKg', { valueAsNumber: true })} 
                  className="w-full bg-background border border-border rounded-xl p-4 text-base font-bold text-center focus:outline-none focus:border-accent transition-colors shadow-inner"
                  placeholder="75"
                />
                {errors.weightKg && <p className="text-error text-xs font-bold mt-1">{errors.weightKg.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Activity Level</label>
              <select 
                {...register('activityLevel')} 
                className="w-full bg-background border border-border rounded-xl p-4 text-base font-bold focus:outline-none focus:border-accent transition-colors shadow-inner appearance-none text-center"
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly Active</option>
                <option value="moderate">Moderately Active</option>
                <option value="high">Highly Active</option>
                <option value="very_high">Athlete</option>
              </select>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-border space-y-5 shadow-2xl">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Capabilities</h2>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Experience</label>
              <select 
                {...register('trainingExperience')} 
                className="w-full bg-background border border-border rounded-xl p-4 text-base font-bold focus:outline-none focus:border-accent transition-colors shadow-inner appearance-none text-center"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Days/Week</label>
              <input 
                type="number" 
                {...register('trainingDays', { valueAsNumber: true })} 
                className="w-full bg-background border border-border rounded-xl p-4 text-base font-bold text-center focus:outline-none focus:border-accent transition-colors shadow-inner"
              />
              {errors.trainingDays && <p className="text-error text-xs font-bold mt-1">{errors.trainingDays.message}</p>}
            </div>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-border space-y-5 shadow-2xl">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">Target Directive</h2>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Goal</label>
              <select 
                {...register('goalType')} 
                className="w-full bg-background border border-border rounded-xl p-4 text-base font-bold focus:outline-none focus:border-accent transition-colors shadow-inner appearance-none text-center"
              >
                <option value="fat_loss">Fat Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="recomposition">Recomposition</option>
                <option value="general_fitness">General</option>
                <option value="strength">Strength</option>
                <option value="aesthetic">Aesthetic</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent-hover text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(255,59,48,0.3)] active:scale-[0.98] mt-8"
          >
            Generate Protocol
          </button>
        </form>
      </div>
    </div>
  );
}

