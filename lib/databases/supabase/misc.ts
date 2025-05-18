import { supabase } from "@/lib/databases/supabase/setup";
import NetInfo from "@react-native-community/netinfo";

import { ExerciseType, Workout } from "@/lib/databases/db-types";

import { getExercisesByWorkout } from "@/lib/databases/sqlite/exercises/read";

import { getSetsByExercise } from "@/lib/databases/sqlite/sets/read";

// Check if device is online
const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected !== false && netInfo.isInternetReachable !== false;
};

export const syncWorkoutById = async (supabaseId: string, workout: Workout): Promise<string | null> => {
    if(!(await isOnline())) {
        console.error("Could not sync workout by ID in Supabase, device is offline");
        return null;
    }

    let supabaseWorkoutId = null;

    try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error("Not authenticated");

        // Sync workout to server
        const { data: workoutData, error: workoutError } = await supabase
            .from("workouts")
            .insert({
                name: workout.name,
                start_time: new Date(workout.start_time).toISOString(),
                active: false,
                user_id: user.data.user.id,
                is_template: workout.is_template,
            })
            .select("id")
            .single();
        if (workoutError) throw workoutError;

        supabaseWorkoutId = workoutData.id;

        // Sync exercises
        const exercises = await getExercisesByWorkout(workout.id);
        for (const exercise of exercises) {
            const { data: exerciseData, error: exerciseError } = await supabase
                .from("exercises")
                .insert({
                    type: exercise.type,
                    workout_id: supabaseWorkoutId,
                    order: exercise.order,
                })
                .select("id")
                .single();
            if (exerciseError) throw exerciseError;

            const supabaseExerciseId = exerciseData.id;
            await db.runAsync(`UPDATE exercises SET synced = 1, supabase_id = ? WHERE id = ?`, [
                supabaseExerciseId,
                exercise.id,
            ]);

            // Sync sets
            const sets = await getSetsByExercise(exercise.id);
            for (const set of sets) {
                const { data: setData, error: setError } = await supabase
                    .from("sets")
                    .insert({
                        weight: set.weight,
                        reps: set.reps,
                        completed: set.completed,
                        exercise_id: supabaseExerciseId,
                    })
                    .select("id")
                    .single();
                if (setError) throw setError;

                await db.runAsync(`UPDATE sets SET synced = 1, supabase_id = ? WHERE id = ?`, [
                    setData.id,
                    set.id,
                ]);
            }
        }
    } catch (err) {
        console.error("Error syncing workout in Supabase:", err);
        return null;
    }

    return supabaseWorkoutId;
};

export const syncUnsyncedWorkouts = async (): Promise<void> => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error("Not authenticated");

    // Sync workout from server
    const { data: workoutData, error: workoutError } = await supabase
        .from("workouts")
        .select()
        .eq("user_id", user.data.user.id);
    if (workoutError) throw workoutError;

    console.log("Server: ", workoutData);

    for(let i = 0; i < workoutData.length; i++) {
        const workout: Workout = workoutData[i];

        if(!workout.synced) {
            const result = await db.runAsync(
                `INSERT INTO workouts (name, start_time, active, synced, is_template, supabase_id)
            VALUES (?, ?, ?, ?, ?, ?)`,
                [workout.name, workout.start_time, workout.active, true, workout.is_template, workout.id],
            );

            // TODO: Check if the result is true first
            // TODO: Check this error, too
            const { error } = await supabase
                .from("workouts")
                .update({ synced: 1 })
                .eq("id", workout.id);
            if (workoutError) throw workoutError;
        }
    }

    const unsyncedWorkouts = await db.getAllAsync<Workout>(
        `SELECT * FROM workouts WHERE synced = 0`,
    );

    for (const workout of unsyncedWorkouts) {
        try {
            await syncWorkoutById(workout.id);
        } catch (err) {
            console.error("Error syncing unsynced workout:", err);
        }
    }
};

// ----- EXERCISE TYPE FUNCTIONS -----

export const getExerciseTypes = async (): Promise<ExerciseType[]> => {
    const rows = await db.getAllAsync<any>(`SELECT * FROM exercise_types`);
    return rows.map((row) => ({
        ...row,
        instructions: JSON.parse(row.instructions),
        primaryMuscles: JSON.parse(row.primaryMuscles),
        secondaryMuscles: JSON.parse(row.secondaryMuscles),
    }));
};

export const getExerciseTypeById = async (id: string): Promise<ExerciseType | null> => {
    const [row] = await db.getAllAsync<any>(`SELECT * FROM exercise_types WHERE id = ?`, [id]);
    if (!row) return null;
    return {
        ...row,
        instructions: JSON.parse(row.instructions),
        primaryMuscles: JSON.parse(row.primaryMuscles),
        secondaryMuscles: JSON.parse(row.secondaryMuscles),
    };
};
