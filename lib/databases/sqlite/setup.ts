import * as SQLite from "expo-sqlite";

import exerciseTypes from "@/assets/data/exercises.json";
// Open the database
export const db = SQLite.openDatabaseSync("workouts.db");

export const seedExerciseTypes = async () => {
    for (const type of exerciseTypes) {
        await db.runAsync(
            `INSERT OR REPLACE INTO exercise_types (
        id, name, instructions, primaryMuscles, secondaryMuscles, level
      ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                type.id,
                type.name,
                JSON.stringify(type.instructions),
                JSON.stringify(type.primaryMuscles),
                JSON.stringify(type.secondaryMuscles),
                type.level,
            ],
        );
    }
};

// Initialize the database
export const initDatabase = async (): Promise<void> => {
    // Create workouts table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS workouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            start_time INTEGER NOT NULL,
            active INTEGER DEFAULT 1,
            synced INTEGER DEFAULT 0,
            supabase_id TEXT,
            is_template INTEGER DEFAULT 0
        );
  `);

    // Create exercises table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            workout_id INTEGER NOT NULL,
            \`order\` INTEGER DEFAULT 0,
            synced INTEGER DEFAULT 0,
            supabase_id TEXT,
            FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
        );
  `);

    // Create sets table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            weight REAL,
            reps INTEGER,
            completed INTEGER DEFAULT 0,
            exercise_id INTEGER NOT NULL,
            synced INTEGER DEFAULT 0,
            supabase_id TEXT,
            FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
        );
  `);

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS exercise_types (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            instructions TEXT, -- Store as JSON string
            primaryMuscles TEXT, -- JSON string
            secondaryMuscles TEXT, -- JSON string
            level TEXT
        );
    `);

    const existing = await db.getAllAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM exercise_types`,
    );

    if (existing[0]?.count === 0) {
        console.log("Seeding exercise types");
        await seedExerciseTypes();
    }
};