import { supabase } from "@/lib/databases/supabase/setup";
import NetInfo from "@react-native-community/netinfo";

// Check if device is online
const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected !== false && netInfo.isInternetReachable !== false;
};

// Add a new workout set
export const supaAddWorkoutSet = async (
    exerciseType: string,
    weight: number,
    reps: number,
): Promise<string | null> => {
    const createdAt = Date.now();
    let supabaseId: string | null = null;

    if(!(await isOnline())) {
        console.error("Could not add a workout set to Supabase, device is offline");
        return null;
    }

    try {
        const user = await supabase.auth.getUser(); // Async method
        if (!user.data.user)
            throw new Error("User not authenticated");

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
    } catch (err) {
        console.error("Error syncing with Supabase:", err);
        return null;
    }

    return supabaseId;
};