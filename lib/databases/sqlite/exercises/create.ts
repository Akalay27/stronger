import * as SQLite from "expo-sqlite";

// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

// Add a new exercise to a workout
export const addExercise = async (workoutId: number, type: string): Promise<number> => {
    let supabaseId: string | null = null;
    let synced = false;

    // Get the highest current order for this workout
    const [maxOrder] = await db.getAllAsync<{ maxOrder: number | null }>(
        `SELECT MAX(\`order\`) as maxOrder FROM exercises WHERE workout_id = ?`,
        [workoutId],
    );

    // Set the new exercise's order to be one higher than the current max (or 0 if this is the first exercise)
    const newOrder = (maxOrder?.maxOrder ?? -1) + 1;

    const result = await db.runAsync(
        `INSERT INTO exercises (type, workout_id, \`order\`, synced, supabase_id)
     VALUES (?, ?, ?, ?, ?)`,
        [type, workoutId, newOrder, synced ? 1 : 0, supabaseId],
    );
    return result.lastInsertRowId;
};

export const addExercises = async (workoutId: number, types: string[]): Promise<number[]> => {
    const exerciseIds: number[] = [];
    for (const type of types) {
        const exerciseId = await addExercise(workoutId, type);
        exerciseIds.push(exerciseId);
    }
    return exerciseIds;
};