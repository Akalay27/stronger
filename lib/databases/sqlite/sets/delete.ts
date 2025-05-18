import * as SQLite from "expo-sqlite";

import { WorkoutSet } from "@/lib/databases/db-types";
import { supaDeleteSet } from "../../supabase/sets/delete";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

// Delete a workout set (legacy)
// export const deleteWorkoutSet = async (id: number): Promise<void> => {
//     const [set] = await db.getAllAsync<WorkoutSet>(`SELECT * FROM workout_sets WHERE id = ?`, [id]);

//     if (set?.supabase_id && (await isOnline())) {
//         try {
//             const { error } = await supabase
//                 .from("workout_sets")
//                 .delete()
//                 .eq("id", set.supabase_id);
//             if (error) throw error;
//         } catch (err) {
//             console.error("Error deleting from Supabase:", err);
//         }
//     }

//     await db.runAsync(`DELETE FROM workout_sets WHERE id = ?`, [id]);
// };

// Delete a set
export const deleteSet = async (id: number): Promise<void> => {
    const [set] = await db.getAllAsync<WorkoutSet>(`SELECT * FROM sets WHERE id = ?`, [id]);

    if(set?.supabase_id)
        await supaDeleteSet(set.supabase_id);
    else
        console.error("Could not delete set from Supabase, set did not have a supabase ID");

    await db.runAsync(`DELETE FROM sets WHERE id = ?`, [id]);
};