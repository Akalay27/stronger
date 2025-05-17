// Type definitions
export interface WorkoutSet {
    id: number;
    weight: number;
    reps: number;
    completed: boolean;
    exercise_id: number;
    synced?: boolean;
    supabase_id?: string;
    is_template: boolean;
}

export interface Exercise {
    id: number;
    type: string;
    workout_id: number;
    order?: number;
    synced?: boolean;
    supabase_id?: string;
}

export interface Workout {
    id: number;
    name: string;
    start_time: number;
    active: boolean;
    synced: boolean;
    supabase_id?: string;
    is_template: boolean;
}

export interface ExerciseType {
    id: string;
    name: string;
    instructions: string[];
    primaryMuscles: string[];
    secondaryMuscles: string[];
    level: string;
}

export type WorkoutWithExerciseList = Workout & {
    exerciseList: string[];
};