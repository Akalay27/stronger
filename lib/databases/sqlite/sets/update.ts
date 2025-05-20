import * as SQLite from "expo-sqlite";

import { WorkoutSet } from "@/lib/databases/db-types";
import { supaUpdateSet, supaUpdateSetCompletion } from "../../supabase/sets/update";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

// Update a set
export const updateSet = async (id: number, weight: number, reps: number): Promise<void> => {
    const [set] = await db.getAllAsync<WorkoutSet>(`SELECT * FROM sets WHERE id = ?`, [id]);

    if (set?.supabase_id)
        await supaUpdateSet(set.supabase_id, weight, reps);
    else
        console.error("Could not update set in Supabase, set did not a Supabase ID");

    await db.runAsync(`UPDATE sets SET weight = ?, reps = ? WHERE id = ?`, [weight, reps, id]);
};

// Update a set's completion status
export const updateSetCompletion = async (id: number, completed: boolean): Promise<void> => {
    const [set] = await db.getAllAsync<WorkoutSet>(`SELECT * FROM sets WHERE id = ?`, [id]);

    if (set?.supabase_id)
        await supaUpdateSetCompletion(set.supabase_id, completed);
    else
        console.error("Could not update set completion in Supabase, set did not have a Supabase ID");

    await db.runAsync(`UPDATE sets SET completed = ? WHERE id = ?`, [completed ? 1 : 0, id]);
};