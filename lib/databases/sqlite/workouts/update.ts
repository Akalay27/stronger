import * as SQLite from "expo-sqlite";

import { Workout } from "@/lib/databases/db-types";
import { syncWorkoutById } from "@/lib/databases/misc";

import { duplicateWorkoutAsTemplate } from "@/lib/databases/sqlite/workouts/create";
import { supaUpdateWorkoutName } from "../../supabase/workouts/update";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

// End a workout (mark as inactive)
export const endWorkout = async (id: number, is_template: boolean): Promise<void> => {
    // Mark the workout as inactive
    await db.runAsync(`UPDATE workouts SET active = 0 WHERE id = ?`, [id]);

    // If saving as template, create a duplicate of this workout as a template
    if (is_template) {
        await duplicateWorkoutAsTemplate(id);
    }

    await syncWorkoutById(id);
};

export const updateWorkoutName = async (id: number, name: string): Promise<void> => {
    const [workout] = await db.getAllAsync<Workout>(`SELECT * FROM workouts WHERE id = ?`, [
        id,
    ]);

    if (workout?.supabase_id)
        await supaUpdateWorkoutName(workout.supabase_id, name);
    else
        console.error("Could not update workout name in Supabase, workout did not have a Supabase ID");

    await db.runAsync(`UPDATE workouts SET name = ? WHERE id = ?`, [name, id]);
};