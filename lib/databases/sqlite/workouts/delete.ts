import * as SQLite from "expo-sqlite";
import { supabase } from "@/lib/databases/supabase/supabase";
import NetInfo from "@react-native-community/netinfo";

import { Workout } from "@/lib/databases/db-types";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

// Check if device is online
const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected !== false && netInfo.isInternetReachable !== false;
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