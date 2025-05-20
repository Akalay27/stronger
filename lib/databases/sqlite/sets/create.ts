import * as SQLite from "expo-sqlite";

import { supaAddWorkoutSet } from "../../supabase/sets/create";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

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

// Add a new workout set
export const addWorkoutSet = async (
    exerciseType: string,
    weight: number,
    reps: number,
): Promise<number> => {
    const createdAt = Date.now();

    const supabaseId: string | null = await supaAddWorkoutSet(exerciseType, weight, reps);
    const synced = supabaseId !== null;

    const result = await db.runAsync(
        `INSERT INTO workout_sets (exercise_type, weight, reps, created_at, synced, supabase_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [exerciseType, weight, reps, createdAt, synced ? 1 : 0, supabaseId],
    );

    return result.lastInsertRowId;
};