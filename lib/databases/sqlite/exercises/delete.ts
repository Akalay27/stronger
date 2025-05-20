import * as SQLite from "expo-sqlite";

import { Exercise } from "@/lib/databases/db-types";

import { supaDeleteExercise } from "@/lib/databases/supabase/exercises/delete";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

// Delete an exercise
export const deleteExercise = async (id: number): Promise<void> => {
    const [exercise] = await db.getAllAsync<Exercise>(`SELECT * FROM exercises WHERE id = ?`, [id]);

    if(exercise?.supabase_id)
        await supaDeleteExercise(exercise.supabase_id);
    else
        console.error("Could not delete exercise from supabase, exercise did not have a supabase ID");

    await db.runAsync(`DELETE FROM exercises WHERE id = ?`, [id]);
};