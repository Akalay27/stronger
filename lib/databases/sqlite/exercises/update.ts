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

// Update the order of an exercise
export const updateExerciseOrder = async (id: number, newOrder: number): Promise<void> => {
    await db.runAsync(`UPDATE exercises SET \`order\` = ? WHERE id = ?`, [newOrder, id]);

    // Try to sync if online
    if (await isOnline()) {
        const [exercise] = await db.getAllAsync<Exercise>(`SELECT * FROM exercises WHERE id = ?`, [
            id,
        ]);

        if (exercise?.supabase_id) {
            try {
                const { error } = await supabase
                    .from("exercises")
                    .update({ order: newOrder })
                    .eq("id", exercise.supabase_id);
                if (error) throw error;
            } catch (err) {
                console.error("Error updating exercise order in Supabase:", err);
            }
        }
    }
};

// Update the order of multiple exercises at once
export const reorderExercises = async (
    exerciseOrders: { id: number; order: number }[],
): Promise<void> => {
    // Start a transaction
    await db.execAsync("BEGIN TRANSACTION");

    try {
        for (const item of exerciseOrders) {
            await db.runAsync(`UPDATE exercises SET \`order\` = ? WHERE id = ?`, [
                item.order,
                item.id,
            ]);
        }

        // Commit the transaction
        await db.execAsync("COMMIT");

        // Try to sync with Supabase if online
        if (await isOnline()) {
            for (const item of exerciseOrders) {
                const [exercise] = await db.getAllAsync<Exercise>(
                    `SELECT * FROM exercises WHERE id = ?`,
                    [item.id],
                );

                if (exercise?.supabase_id) {
                    try {
                        await supabase
                            .from("exercises")
                            .update({ order: item.order })
                            .eq("id", exercise.supabase_id);
                    } catch (err) {
                        console.error("Error updating exercise order in Supabase:", err);
                    }
                }
            }
        }
    } catch (error) {
        // If anything goes wrong, roll back the transaction
        await db.execAsync("ROLLBACK");
        throw error;
    }
};