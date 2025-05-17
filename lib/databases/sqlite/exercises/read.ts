import * as SQLite from "expo-sqlite";

import { Exercise } from "@/lib/databases/db-types";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

// Get exercises for a workout
export const getExercisesByWorkout = async (workoutId: number): Promise<Exercise[]> => {
    const rows = await db.getAllAsync<Exercise>(
        `SELECT * FROM exercises WHERE workout_id = ? ORDER BY \`order\` ASC`,
        [workoutId],
    );
    return rows.map((row) => ({ ...row, synced: !!row.synced }));
};