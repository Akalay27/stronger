import * as SQLite from "expo-sqlite";
import { supabase } from "@/lib/databases/supabase/supabase";
import NetInfo from "@react-native-community/netinfo";

import { Exercise } from "@/lib/databases/db-types";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

// Check if device is online
const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected !== false && netInfo.isInternetReachable !== false;
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