import * as SQLite from "expo-sqlite";
import { supabase } from "@/lib/databases/supabase/supabase";
import NetInfo from "@react-native-community/netinfo";

import { WorkoutSet } from "@/lib/databases/db-types";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

// Check if device is online
const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected !== false && netInfo.isInternetReachable !== false;
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