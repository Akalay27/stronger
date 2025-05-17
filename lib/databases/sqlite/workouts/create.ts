import * as SQLite from "expo-sqlite";
import NetInfo from "@react-native-community/netinfo";

import { Workout } from "@/lib/databases/db-types";

import { addExercise } from "@/lib/databases/sqlite/exercises/create";
import { getExercisesByWorkout } from "@/lib/databases/sqlite/exercises/read";

import { addSet } from "@/lib/databases/sqlite/sets/create";
import { getSetsByExercise } from "@/lib/databases/sqlite/sets/read";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

// Check if device is online
const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected !== false && netInfo.isInternetReachable !== false;
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