import * as SQLite from 'expo-sqlite';
import { supabase } from './supabase';
import NetInfo from '@react-native-community/netinfo';
// Open the database
const db = SQLite.openDatabaseSync('workouts.db');

// Type definitions
export interface WorkoutSet {
    id: number;
    weight: number;
    reps: number;
    completed: boolean;
    exercise_id: number;
    synced?: boolean;
    supabase_id?: string;
}

export interface Exercise {
    id: number;
    type: string;
    workout_id: number;
    synced?: boolean;
    supabase_id?: string;
}

export interface Workout {
    id: number;
    name: string;
    start_time: number;
    active: boolean;
    synced?: boolean;
    supabase_id?: string;
}

// Initialize the database
export const initDatabase = async (): Promise<void> => {
    // Create workouts table
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      active INTEGER DEFAULT 1,
      synced INTEGER DEFAULT 0,
      supabase_id TEXT
    );
  `);

    // Create exercises table
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      workout_id INTEGER NOT NULL,
      synced INTEGER DEFAULT 0,
      supabase_id TEXT,
      FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
    );
  `);

    // Create sets table
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      weight REAL NOT NULL,
      reps INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      exercise_id INTEGER NOT NULL,
      synced INTEGER DEFAULT 0,
      supabase_id TEXT,
      FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
    );
  `);
};

// Check if device is online
const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected !== false && netInfo.isInternetReachable !== false;
};

// Add a new workout set
export const addWorkoutSet = async (
    exerciseType: string,
    weight: number,
    reps: number,
): Promise<number> => {
    const createdAt = Date.now();
    let supabaseId: string | null = null;
    let synced = false;

    if (await isOnline()) {
        try {
            const user = await supabase.auth.getUser(); // Async method
            if (!user.data.user) {
                throw new Error('User not authenticated');
            }
            const { data, error } = await supabase
                .from('workout_sets')
                .insert({
                    exercise_type: exerciseType,
                    weight,
                    reps,
                    created_at: new Date(createdAt).toISOString(),
                    user_id: user?.data.user?.id, // Assuming user ID is available
                })
                .select('id')
                .single();
            if (error) throw error;
            supabaseId = data.id;
            synced = true;
        } catch (err) {
            console.error('Error syncing with Supabase:', err);
        }
    }

    const result = await db.runAsync(
        `INSERT INTO workout_sets (exercise_type, weight, reps, created_at, synced, supabase_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [exerciseType, weight, reps, createdAt, synced ? 1 : 0, supabaseId],
    );
    return result.lastInsertRowId;
};

// Get all workout sets
export const getAllWorkoutSets = async (): Promise<WorkoutSet[]> => {
    const rows = await db.getAllAsync<WorkoutSet>(
        `SELECT * FROM workout_sets ORDER BY created_at DESC`,
    );
    return rows.map((row) => ({ ...row, synced: !!row.synced }));
};

// Get workout sets with pagination (legacy)
export const getWorkoutSetsPaginated = async (limit = 20, offset = 0): Promise<WorkoutSet[]> => {
    const rows = await db.getAllAsync<WorkoutSet>(
        `SELECT * FROM workout_sets ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset],
    );
    return rows.map((row) => ({ ...row, synced: !!row.synced }));
};

// Delete a workout set (legacy)
export const deleteWorkoutSet = async (id: number): Promise<void> => {
    const [set] = await db.getAllAsync<WorkoutSet>(`SELECT * FROM workout_sets WHERE id = ?`, [id]);

    if (set?.supabase_id && (await isOnline())) {
        try {
            const { error } = await supabase
                .from('workout_sets')
                .delete()
                .eq('id', set.supabase_id);
            if (error) throw error;
        } catch (err) {
            console.error('Error deleting from Supabase:', err);
        }
    }

    await db.runAsync(`DELETE FROM workout_sets WHERE id = ?`, [id]);
};

// Create a new workout
export const createWorkout = async (name: string): Promise<number> => {
    const startTime = Date.now();
    const result = await db.runAsync(
        `INSERT INTO workouts (name, start_time, active, synced)
     VALUES (?, ?, 1, 0)`,
        [name, startTime],
    );
    return result.lastInsertRowId;
};

// Get active workout
export const getActiveWorkout = async (): Promise<Workout | null> => {
    const [workout] = await db.getAllAsync<Workout>(
        `SELECT * FROM workouts WHERE active = 1 ORDER BY start_time DESC LIMIT 1`,
    );

    if (!workout) return null;

    return { ...workout, active: !!workout.active, synced: !!workout.synced };
};

// Get all workouts
export const getAllWorkouts = async (): Promise<Workout[]> => {
    const rows = await db.getAllAsync<Workout>(`SELECT * FROM workouts ORDER BY start_time DESC`);
    return rows.map((row) => ({
        ...row,
        active: !!row.active,
        synced: !!row.synced,
    }));
};

export const syncWorkoutById = async (workoutId: number): Promise<void> => {
    const [workout] = await db.getAllAsync<Workout>(`SELECT * FROM workouts WHERE id = ?`, [
        workoutId,
    ]);
    if (!workout || workout.synced) return;

    try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error('Not authenticated');

        // Sync workout
        const { data: workoutData, error: workoutError } = await supabase
            .from('workouts')
            .insert({
                name: workout.name,
                start_time: new Date(workout.start_time).toISOString(),
                active: false,
                user_id: user.data.user.id,
            })
            .select('id')
            .single();
        if (workoutError) throw workoutError;

        const supabaseWorkoutId = workoutData.id;

        await db.runAsync(`UPDATE workouts SET synced = 1, supabase_id = ? WHERE id = ?`, [
            supabaseWorkoutId,
            workout.id,
        ]);

        // Sync exercises
        const exercises = await getExercisesByWorkout(workout.id);
        for (const exercise of exercises) {
            const { data: exerciseData, error: exerciseError } = await supabase
                .from('exercises')
                .insert({
                    type: exercise.type,
                    workout_id: supabaseWorkoutId,
                })
                .select('id')
                .single();
            if (exerciseError) throw exerciseError;

            const supabaseExerciseId = exerciseData.id;
            await db.runAsync(`UPDATE exercises SET synced = 1, supabase_id = ? WHERE id = ?`, [
                supabaseExerciseId,
                exercise.id,
            ]);

            // Sync sets
            const sets = await getSetsByExercise(exercise.id);
            for (const set of sets) {
                const { data: setData, error: setError } = await supabase
                    .from('sets')
                    .insert({
                        weight: set.weight,
                        reps: set.reps,
                        completed: set.completed,
                        exercise_id: supabaseExerciseId,
                    })
                    .select('id')
                    .single();
                if (setError) throw setError;

                await db.runAsync(`UPDATE sets SET synced = 1, supabase_id = ? WHERE id = ?`, [
                    setData.id,
                    set.id,
                ]);
            }
        }
    } catch (err) {
        console.error('Error syncing workout:', err);
    }
};

// End a workout (mark as inactive)
export const endWorkout = async (id: number): Promise<void> => {
    await db.runAsync(`UPDATE workouts SET active = 0 WHERE id = ?`, [id]);

    // Try immediate sync
    if (await isOnline()) {
        await syncWorkoutById(id);
    }
};

export const deleteWorkout = async (id: number): Promise<void> => {
    const [workout] = await db.getAllAsync<Workout>(`SELECT * FROM workouts WHERE id = ?`, [id]);
    if (!workout) return;
    if (workout.supabase_id && (await isOnline())) {
        try {
            const { error } = await supabase
                .from('workouts')
                .delete()
                .eq('id', workout.supabase_id);
            if (error) throw error;
        } catch (err) {
            console.error('Error deleting workout from Supabase:', err);
        }
    }
    await db.runAsync(`DELETE FROM workouts WHERE id = ?`, [id]);
};

export const syncUnsyncedWorkouts = async (): Promise<void> => {
    const unsyncedWorkouts = await db.getAllAsync<Workout>(
        `SELECT * FROM workouts WHERE synced = 0`,
    );

    for (const workout of unsyncedWorkouts) {
        try {
            await syncWorkoutById(workout.id);
        } catch (err) {
            console.error('Error syncing unsynced workout:', err);
        }
    }
};

// ----- EXERCISE FUNCTIONS -----

// Add a new exercise to a workout
export const addExercise = async (workoutId: number, type: string): Promise<number> => {
    let supabaseId: string | null = null;
    let synced = false;
    const result = await db.runAsync(
        `INSERT INTO exercises (type, workout_id, synced, supabase_id)
     VALUES (?, ?, ?, ?)`,
        [type, workoutId, synced ? 1 : 0, supabaseId],
    );
    return result.lastInsertRowId;
};

// Get exercises for a workout
export const getExercisesByWorkout = async (workoutId: number): Promise<Exercise[]> => {
    const rows = await db.getAllAsync<Exercise>(
        `SELECT * FROM exercises WHERE workout_id = ? ORDER BY id ASC`,
        [workoutId],
    );
    return rows.map((row) => ({ ...row, synced: !!row.synced }));
};

// Delete an exercise
export const deleteExercise = async (id: number): Promise<void> => {
    const [exercise] = await db.getAllAsync<Exercise>(`SELECT * FROM exercises WHERE id = ?`, [id]);

    if (exercise?.supabase_id && (await isOnline())) {
        try {
            const { error } = await supabase
                .from('exercises')
                .delete()
                .eq('id', exercise.supabase_id);
            if (error) throw error;
        } catch (err) {
            console.error('Error deleting exercise from Supabase:', err);
        }
    }

    await db.runAsync(`DELETE FROM exercises WHERE id = ?`, [id]);
};

// ----- SET FUNCTIONS -----

// Add a new set to an exercise
export const addSet = async (
    exerciseId: number,
    weight: number,
    reps: number,
    completed = false,
): Promise<number> => {
    let supabaseId: string | null = null;
    let synced = false;

    const result = await db.runAsync(
        `INSERT INTO sets (weight, reps, completed, exercise_id, synced, supabase_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [weight, reps, completed ? 1 : 0, exerciseId, synced ? 1 : 0, supabaseId],
    );
    return result.lastInsertRowId;
};

// Get sets for an exercise
export const getSetsByExercise = async (exerciseId: number): Promise<WorkoutSet[]> => {
    const rows = await db.getAllAsync<WorkoutSet>(
        `SELECT * FROM sets WHERE exercise_id = ? ORDER BY id ASC`,
        [exerciseId],
    );
    return rows.map((row) => ({
        ...row,
        completed: !!row.completed,
        synced: !!row.synced,
    }));
};

// Update a set's completion status
export const updateSetCompletion = async (id: number, completed: boolean): Promise<void> => {
    await db.runAsync(`UPDATE sets SET completed = ? WHERE id = ?`, [completed ? 1 : 0, id]);

    if (await isOnline()) {
        const [set] = await db.getAllAsync<WorkoutSet>(`SELECT * FROM sets WHERE id = ?`, [id]);

        if (set?.supabase_id) {
            try {
                const { error } = await supabase
                    .from('sets')
                    .update({ completed })
                    .eq('id', set.supabase_id);
                if (error) throw error;
            } catch (err) {
                console.error('Error updating set in Supabase:', err);
            }
        }
    }
};

// Delete a set
export const deleteSet = async (id: number): Promise<void> => {
    const [set] = await db.getAllAsync<WorkoutSet>(`SELECT * FROM sets WHERE id = ?`, [id]);

    if (set?.supabase_id && (await isOnline())) {
        try {
            const { error } = await supabase.from('sets').delete().eq('id', set.supabase_id);
            if (error) throw error;
        } catch (err) {
            console.error('Error deleting set from Supabase:', err);
        }
    }

    await db.runAsync(`DELETE FROM sets WHERE id = ?`, [id]);
};
