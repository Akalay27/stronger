import * as SQLite from "expo-sqlite";

import { Workout, WorkoutWithExerciseList } from "@/lib/databases/db-types";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

// Get active workout
export const getActiveWorkout = async (): Promise<Workout | null> => {
    const [workout] = await db.getAllAsync<Workout>(
        `SELECT * FROM workouts WHERE active = 1 ORDER BY start_time DESC LIMIT 1`,
    );

    if (!workout) return null;

    return { ...workout, active: !!workout.active, synced: !!workout.synced };
};

export const getWorkout = async (id: number): Promise<Workout | null> => {
    const [workout] = await db.getAllAsync<Workout>(`SELECT * FROM workouts WHERE id = ?`, [id]);
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

export const getAllWorkoutsWithData = async (): Promise<WorkoutWithExerciseList[]> => {
    // First, get all template workouts
    const workouts = await db.getAllAsync<Workout>(
        `SELECT * FROM workouts WHERE is_template = 0 ORDER BY start_time DESC`,
    );

    const workoutIds = workouts.map((w) => w.id);
    if (workoutIds.length === 0) return [];

    // Now, get all exercises + type names for these workouts
    const rows = await db.getAllAsync<{
        workout_id: number;
        exercise_name: string;
    }>(
        `
        SELECT e.workout_id, et.name AS exercise_name
        FROM exercises e
        JOIN exercise_types et ON e.type = et.id
        WHERE e.workout_id IN (${workoutIds.map(() => "?").join(",")})
        ORDER BY e.workout_id, e.\`order\` ASC
    `,
        workoutIds,
    );

    // Group exercise names by workout ID
    const workoutMap = new Map<number, string[]>();
    for (const row of rows) {
        if (!workoutMap.has(row.workout_id)) {
            workoutMap.set(row.workout_id, []);
        }
        workoutMap.get(row.workout_id)!.push(row.exercise_name);
    }
    // Sort exercise lists by order property

    // Merge workout metadata with exercise names
    return workouts.map((w) => ({
        ...w,
        active: !!w.active,
        synced: !!w.synced,
        exerciseList: workoutMap.get(w.id) ?? [],
    }));
};

export const getAllTemplates = async (): Promise<WorkoutWithExerciseList[]> => {
    // First, get all template workouts
    const workouts = await db.getAllAsync<Workout>(
        `SELECT * FROM workouts WHERE is_template = 1 ORDER BY start_time DESC`,
    );

    const workoutIds = workouts.map((w) => w.id);
    if (workoutIds.length === 0) return [];

    // Now, get all exercises + type names for these workouts
    const rows = await db.getAllAsync<{
        workout_id: number;
        exercise_name: string;
    }>(
        `
        SELECT e.workout_id, et.name AS exercise_name
        FROM exercises e
        JOIN exercise_types et ON e.type = et.id
        WHERE e.workout_id IN (${workoutIds.map(() => "?").join(",")})
        ORDER BY e.workout_id, e.\`order\` ASC
    `,
        workoutIds,
    );

    // Group exercise names by workout ID
    const workoutMap = new Map<number, string[]>();
    for (const row of rows) {
        if (!workoutMap.has(row.workout_id)) {
            workoutMap.set(row.workout_id, []);
        }
        workoutMap.get(row.workout_id)!.push(row.exercise_name);
    }
    // Sort exercise lists by order property

    // Merge workout metadata with exercise names
    return workouts.map((w) => ({
        ...w,
        active: !!w.active,
        synced: !!w.synced,
        exerciseList: workoutMap.get(w.id) ?? [],
    }));
};

// Get workout count
export const getWorkoutCount = async (): Promise<number> => {
    const [result] = await db.getAllAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM workouts`,
    );
    return result.count;
};