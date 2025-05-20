import * as SQLite from "expo-sqlite";

import { Workout } from "@/lib/databases/db-types";
import { supaDeleteWorkout } from "../../supabase/workouts/delete";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

export const deleteWorkout = async (id: number): Promise<void> => {
    const [workout] = await db.getAllAsync<Workout>(`SELECT * FROM workouts WHERE id = ?`, [id]);
    if (!workout) return;

    if(workout.supabase_id)
        await supaDeleteWorkout(workout.supabase_id);
    else
        console.error("Could not delete workout from Supabase, workout did not have a Supabase ID");

    await db.runAsync(`DELETE FROM workouts WHERE id = ?`, [id]);
};