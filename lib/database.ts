import * as SQLite from "expo-sqlite";
import { supabase } from "./supabase";
import NetInfo from "@react-native-community/netinfo";
import exerciseTypes from "@/assets/data/exercises.json";
// Open the database
export const db = SQLite.openDatabaseSync("workouts.db");

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

export const seedExerciseTypes = async () => {
    for (const type of exerciseTypes) {
        await db.runAsync(
            `INSERT OR REPLACE INTO exercise_types (
        id, name, instructions, primaryMuscles, secondaryMuscles, level
      ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                type.id,
                type.name,
                JSON.stringify(type.instructions),
                JSON.stringify(type.primaryMuscles),
                JSON.stringify(type.secondaryMuscles),
                type.level,
            ],
        );
    }
};

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
            supabase_id TEXT,
            is_template INTEGER DEFAULT 0
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
            weight REAL,
            reps INTEGER,
            completed INTEGER DEFAULT 0,
            exercise_id INTEGER NOT NULL,
            synced INTEGER DEFAULT 0,
            supabase_id TEXT,
            FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
        );
  `);

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS exercise_types (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            instructions TEXT, -- Store as JSON string
            primaryMuscles TEXT, -- JSON string
            secondaryMuscles TEXT, -- JSON string
            level TEXT
        );
    `);

    const existing = await db.getAllAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM exercise_types`,
    );
    if (existing[0]?.count === 0) {
        console.log("Seeding exercise types");
        await seedExerciseTypes();
    }
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
                throw new Error("User not authenticated");
            }
            const { data, error } = await supabase
                .from("workout_sets")
                .insert({
                    exercise_type: exerciseType,
                    weight,
                    reps,
                    created_at: new Date(createdAt).toISOString(),
                    user_id: user?.data.user?.id, // Assuming user ID is available
                })
                .select("id")
                .single();
            if (error) throw error;
            supabaseId = data.id;
            synced = true;
        } catch (err) {
            console.error("Error syncing with Supabase:", err);
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
                .from("workout_sets")
                .delete()
                .eq("id", set.supabase_id);
            if (error) throw error;
        } catch (err) {
            console.error("Error deleting from Supabase:", err);
        }
    }

    await db.runAsync(`DELETE FROM workout_sets WHERE id = ?`, [id]);
};

// Create a new workout
export const createWorkout = async (name: string): Promise<number> => {
    const startTime = Date.now();
    const result = await db.runAsync(
        `INSERT INTO workouts (name, start_time, active, synced, is_template)
     VALUES (?, ?, 1, 0, 0)`,
        [name, startTime],
    );
    return result.lastInsertRowId;
};

export const createFromTemplate = async (templateId: number): Promise<number> => {
    // Fetch the template workout
    const [templateWorkout] = await db.getAllAsync<Workout>(
        `SELECT * FROM workouts WHERE id = ? AND is_template = 1`,
        [templateId],
    );
    if (!templateWorkout) {
        throw new Error("Template workout not found");
    }

    // Create a new workout based on the template
    const newWorkoutId = await createWorkout(templateWorkout.name);

    // Fetch exercises from the template workout
    const templateExercises = await getExercisesByWorkout(templateId);

    for (const templateExercise of templateExercises) {
        // Add each exercise to the new workout
        const newExerciseId = await addExercise(newWorkoutId, templateExercise.type);

        // Fetch sets from the template exercise
        const templateSets = await getSetsByExercise(templateExercise.id);

        for (const templateSet of templateSets) {
            // Add each set to the new exercise
            await addSet(newExerciseId, templateSet.weight, templateSet.reps, false);
        }
    }

    return newWorkoutId;
};

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

export type WorkoutWithExerciseList = Workout & {
    exerciseList: string[];
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
        ORDER BY e.workout_id, e.id
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

    // Merge workout metadata with exercise names
    return workouts.map((w) => ({
        ...w,
        active: !!w.active,
        synced: !!w.synced,
        exerciseList: workoutMap.get(w.id) ?? [],
    }));
};

export const syncWorkoutById = async (workoutId: number): Promise<void> => {
    const [workout] = await db.getAllAsync<Workout>(`SELECT * FROM workouts WHERE id = ?`, [
        workoutId,
    ]);
    if (!workout || workout.synced) return;

    try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error("Not authenticated");

        // Sync workout
        const { data: workoutData, error: workoutError } = await supabase
            .from("workouts")
            .insert({
                name: workout.name,
                start_time: new Date(workout.start_time).toISOString(),
                active: false,
                user_id: user.data.user.id,
            })
            .select("id")
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
                .from("exercises")
                .insert({
                    type: exercise.type,
                    workout_id: supabaseWorkoutId,
                })
                .select("id")
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
                    .from("sets")
                    .insert({
                        weight: set.weight,
                        reps: set.reps,
                        completed: set.completed,
                        exercise_id: supabaseExerciseId,
                    })
                    .select("id")
                    .single();
                if (setError) throw setError;

                await db.runAsync(`UPDATE sets SET synced = 1, supabase_id = ? WHERE id = ?`, [
                    setData.id,
                    set.id,
                ]);
            }
        }
    } catch (err) {
        console.error("Error syncing workout:", err);
    }
};

// Duplicate a workout as a template
export const duplicateWorkoutAsTemplate = async (sourceWorkoutId: number): Promise<number> => {
    // Get source workout details
    const [sourceWorkout] = await db.getAllAsync<Workout>(`SELECT * FROM workouts WHERE id = ?`, [
        sourceWorkoutId,
    ]);

    if (!sourceWorkout) {
        throw new Error("Source workout not found");
    }

    // Create a new template workout with the same name
    const result = await db.runAsync(
        `INSERT INTO workouts (name, start_time, active, synced, is_template)
         VALUES (?, ?, 0, 0, 1)`,
        [sourceWorkout.name, Date.now()],
    );

    const newTemplateId = result.lastInsertRowId;

    // Copy all exercises from source workout
    const exercises = await getExercisesByWorkout(sourceWorkoutId);
    for (const exercise of exercises) {
        // Add each exercise to the template
        const newExerciseId = await addExercise(newTemplateId, exercise.type);

        // Copy all sets from source exercise
        const sets = await getSetsByExercise(exercise.id);
        for (const set of sets) {
            await addSet(newExerciseId, set.weight, set.reps, set.completed);
        }
    }

    return newTemplateId;
};

// End a workout (mark as inactive)
export const endWorkout = async (id: number, is_template: boolean): Promise<void> => {
    // Mark the workout as inactive
    await db.runAsync(`UPDATE workouts SET active = 0 WHERE id = ?`, [id]);

    // If saving as template, create a duplicate of this workout as a template
    if (is_template) {
        await duplicateWorkoutAsTemplate(id);
    }

    // Try immediate sync
    if (await isOnline()) {
        await syncWorkoutById(id);
    }
};

// Get workout count
export const getWorkoutCount = async (): Promise<number> => {
    const [result] = await db.getAllAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM workouts`,
    );
    return result.count;
};

export const deleteWorkout = async (id: number): Promise<void> => {
    const [workout] = await db.getAllAsync<Workout>(`SELECT * FROM workouts WHERE id = ?`, [id]);
    if (!workout) return;
    if (workout.supabase_id && (await isOnline())) {
        try {
            const { error } = await supabase
                .from("workouts")
                .delete()
                .eq("id", workout.supabase_id);
            if (error) throw error;
        } catch (err) {
            console.error("Error deleting workout from Supabase:", err);
        }
    }
    await db.runAsync(`DELETE FROM workouts WHERE id = ?`, [id]);
};

export const updateWorkoutName = async (id: number, name: string): Promise<void> => {
    await db.runAsync(`UPDATE workouts SET name = ? WHERE id = ?`, [name, id]);

    // Try to sync if online
    if (await isOnline()) {
        const [workout] = await db.getAllAsync<Workout>(`SELECT * FROM workouts WHERE id = ?`, [
            id,
        ]);

        if (workout?.supabase_id) {
            try {
                const { error } = await supabase
                    .from("workouts")
                    .update({ name })
                    .eq("id", workout.supabase_id);
                if (error) throw error;
            } catch (err) {
                console.error("Error updating workout in Supabase:", err);
            }
        }
    }
};

export const syncUnsyncedWorkouts = async (): Promise<void> => {
    const unsyncedWorkouts = await db.getAllAsync<Workout>(
        `SELECT * FROM workouts WHERE synced = 0`,
    );

    for (const workout of unsyncedWorkouts) {
        try {
            await syncWorkoutById(workout.id);
        } catch (err) {
            console.error("Error syncing unsynced workout:", err);
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

export const addExercises = async (workoutId: number, types: string[]): Promise<number[]> => {
    const exerciseIds: number[] = [];
    for (const type of types) {
        const exerciseId = await addExercise(workoutId, type);
        exerciseIds.push(exerciseId);
    }
    return exerciseIds;
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
                .from("exercises")
                .delete()
                .eq("id", exercise.supabase_id);
            if (error) throw error;
        } catch (err) {
            console.error("Error deleting exercise from Supabase:", err);
        }
    }

    await db.runAsync(`DELETE FROM exercises WHERE id = ?`, [id]);
};

// ----- (exercise) SET FUNCTIONS -----

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

// Update a set
export const updateSet = async (id: number, weight: number, reps: number): Promise<void> => {
    await db.runAsync(`UPDATE sets SET weight = ?, reps = ? WHERE id = ?`, [weight, reps, id]);

    if (await isOnline()) {
        const [set] = await db.getAllAsync<WorkoutSet>(`SELECT * FROM sets WHERE id = ?`, [id]);

        if (set?.supabase_id) {
            try {
                const { error } = await supabase
                    .from("sets")
                    .update({ weight, reps })
                    .eq("id", set.supabase_id);
                if (error) throw error;
            } catch (err) {
                console.error("Error updating set in Supabase:", err);
            }
        }
    }
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
                    .from("sets")
                    .update({ completed })
                    .eq("id", set.supabase_id);
                if (error) throw error;
            } catch (err) {
                console.error("Error updating set in Supabase:", err);
            }
        }
    }
};

// Delete a set
export const deleteSet = async (id: number): Promise<void> => {
    const [set] = await db.getAllAsync<WorkoutSet>(`SELECT * FROM sets WHERE id = ?`, [id]);

    if (set?.supabase_id && (await isOnline())) {
        try {
            const { error } = await supabase.from("sets").delete().eq("id", set.supabase_id);
            if (error) throw error;
        } catch (err) {
            console.error("Error deleting set from Supabase:", err);
        }
    }

    await db.runAsync(`DELETE FROM sets WHERE id = ?`, [id]);
};

// ----- EXERCISE TYPE FUNCTIONS -----

export const getExerciseTypes = async (): Promise<ExerciseType[]> => {
    const rows = await db.getAllAsync<any>(`SELECT * FROM exercise_types`);
    return rows.map((row) => ({
        ...row,
        instructions: JSON.parse(row.instructions),
        primaryMuscles: JSON.parse(row.primaryMuscles),
        secondaryMuscles: JSON.parse(row.secondaryMuscles),
    }));
};

export const getExerciseTypeById = async (id: string): Promise<ExerciseType | null> => {
    const [row] = await db.getAllAsync<any>(`SELECT * FROM exercise_types WHERE id = ?`, [id]);
    if (!row) return null;
    return {
        ...row,
        instructions: JSON.parse(row.instructions),
        primaryMuscles: JSON.parse(row.primaryMuscles),
        secondaryMuscles: JSON.parse(row.secondaryMuscles),
    };
};
