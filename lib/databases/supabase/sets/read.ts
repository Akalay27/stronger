import * as SQLite from "expo-sqlite";

import { WorkoutSet } from "@/lib/databases/db-types";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

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