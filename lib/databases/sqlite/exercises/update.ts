import * as SQLite from "expo-sqlite";

import { Exercise } from "@/lib/databases/db-types";

import { supaUpdateExerciseOrder } from "../../supabase/exercises/update";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

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

        for (const item of exerciseOrders) {
            const [exercise] = await db.getAllAsync<Exercise>(
                `SELECT * FROM exercises WHERE id = ?`,
                [item.id],
            );

            if (exercise?.supabase_id)
                await supaUpdateExerciseOrder(exercise.supabase_id, item.order);
            else
                console.error("Could not update exercise order in supabase, exercise did not have a supabase ID");
        }
    } catch (error) {
        // If anything goes wrong, roll back the transaction
        await db.execAsync("ROLLBACK");
        throw error;
    }
};

// Update the order of an exercise
export const updateExerciseOrder = async (id: number, newOrder: number): Promise<void> => {
    const [exercise] = await db.getAllAsync<Exercise>(`SELECT * FROM exercises WHERE id = ?`, [id]);

    if (exercise?.supabase_id)
        await supaUpdateExerciseOrder(exercise.supabase_id, newOrder);
    else
        console.error("Could not update exercise order in supabase, exercise did not have a supabase ID");

    await db.runAsync(`UPDATE exercises SET \`order\` = ? WHERE id = ?`, [newOrder, id]);
};