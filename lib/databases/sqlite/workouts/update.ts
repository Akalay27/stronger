import * as SQLite from "expo-sqlite";
import { supabase } from "@/lib/databases/supabase/supabase";
import NetInfo from "@react-native-community/netinfo";

import { Workout } from "@/lib/databases/db-types";
import { syncWorkoutById } from "@/lib/databases/sqlite/misc";

import { duplicateWorkoutAsTemplate } from "@/lib/databases/sqlite/workouts/create";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

// Check if device is online
const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected !== false && netInfo.isInternetReachable !== false;
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