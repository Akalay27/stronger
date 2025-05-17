import * as SQLite from "expo-sqlite";
import { supabase } from "@/lib/databases/supabase/supabase";
import NetInfo from "@react-native-community/netinfo";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

// Check if device is online
const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected !== false && netInfo.isInternetReachable !== false;
};

// Add a new workout set
export const addWorkoutSet = async (
    exerciseType: string,
    weight: number,
    reps: number,
): Promise<number> => {
    const createdAt = Date.now();
    let supabaseId: string | null = null;
    let synced = false;

    if (await isOnline()) {
        try {
            const user = await supabase.auth.getUser(); // Async method
            if (!user.data.user) {
                throw new Error("User not authenticated");
            }
            const { data, error } = await supabase
                .from("workout_sets")
                .insert({
                    exercise_type: exerciseType,
                    weight,
                    reps,
                    created_at: new Date(createdAt).toISOString(),
                    user_id: user?.data.user?.id, // Assuming user ID is available
                })
                .select("id")
                .single();
            if (error) throw error;
            supabaseId = data.id;
            synced = true;
        } catch (err) {
            console.error("Error syncing with Supabase:", err);
        }
    }

    const result = await db.runAsync(
        `INSERT INTO workout_sets (exercise_type, weight, reps, created_at, synced, supabase_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [exerciseType, weight, reps, createdAt, synced ? 1 : 0, supabaseId],
    );
    return result.lastInsertRowId;
};

// Add a new set to an exercise
export const addSet = async (
    exerciseId: number,
    weight: number,
    reps: number,
    completed = false,
): Promise<number> => {
    let supabaseId: string | null = null;
    let synced = false;

    const result = await db.runAsync(
        `INSERT INTO sets (weight, reps, completed, exercise_id, synced, supabase_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [weight, reps, completed ? 1 : 0, exerciseId, synced ? 1 : 0, supabaseId],
    );
    return result.lastInsertRowId;
};