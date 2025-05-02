import * as SQLite from "expo-sqlite";
import { supabase } from "./supabase";
import NetInfo from "@react-native-community/netinfo";
// Open the database
const db = SQLite.openDatabaseSync("workouts.db");

// Type definitions
export interface WorkoutSet {
  id: number;
  exercise_type: string;
  weight: number;
  reps: number;
  created_at: number;
  synced?: boolean;
  supabase_id?: string;
}

// Initialize the database
export const initDatabase = async (): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_type TEXT NOT NULL,
      weight REAL NOT NULL,
      reps INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      synced INTEGER DEFAULT 0,
      supabase_id TEXT
    );
  `);
};

// Check if device is online
const isOnline = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected !== false && netInfo.isInternetReachable !== false;
};

// Add a new workout set
export const addWorkoutSet = async (
  exerciseType: string,
  weight: number,
  reps: number
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
    [exerciseType, weight, reps, createdAt, synced ? 1 : 0, supabaseId]
  );
  return result.lastInsertRowId;
};

// Get all workout sets
export const getAllWorkoutSets = async (): Promise<WorkoutSet[]> => {
  const rows = await db.getAllAsync<WorkoutSet>(
    `SELECT * FROM workout_sets ORDER BY created_at DESC`
  );
  return rows.map((row) => ({ ...row, synced: !!row.synced }));
};

// Get workout sets with pagination
export const getWorkoutSetsPaginated = async (
  limit = 20,
  offset = 0
): Promise<WorkoutSet[]> => {
  const rows = await db.getAllAsync<WorkoutSet>(
    `SELECT * FROM workout_sets ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows.map((row) => ({ ...row, synced: !!row.synced }));
};

// Delete a workout set
export const deleteWorkoutSet = async (id: number): Promise<void> => {
  const [set] = await db.getAllAsync<WorkoutSet>(
    `SELECT * FROM workout_sets WHERE id = ?`,
    [id]
  );

  if (set?.supabase_id && (await isOnline())) {
    try {
      const { error } = await supabase
        .from("workout_sets")
        .delete()
        .eq("id", set.supabase_id);
      if (error) throw error;
    } catch (err) {
      console.error("Error deleting from Supabase:", err);
    }
  }

  await db.runAsync(`DELETE FROM workout_sets WHERE id = ?`, [id]);
};

// Sync unsynced sets
export const syncUnsyncedSets = async (): Promise<void> => {
  if (!(await isOnline())) return;

  const unsyncedSets = await db.getAllAsync<WorkoutSet>(
    `SELECT * FROM workout_sets WHERE synced = 0`
  );

  for (const set of unsyncedSets) {
    try {
      const user = await supabase.auth.getUser(); // Async method
      const { data, error } = await supabase
        .from("workout_sets")
        .insert({
          exercise_type: set.exercise_type,
          weight: set.weight,
          reps: set.reps,
          created_at: new Date(set.created_at).toISOString(),
          user_id: user?.data.user?.id, // Assuming user ID is available
        })
        .select("id")
        .single();
      if (error) throw error;

      await db.runAsync(
        `UPDATE workout_sets SET synced = 1, supabase_id = ? WHERE id = ?`,
        [data.id, set.id]
      );
    } catch (err) {
      console.error("Error syncing set with Supabase:", err);
    }
  }
};
