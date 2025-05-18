import { supabase } from "@/lib/databases/supabase/setup";
import NetInfo from "@react-native-community/netinfo";

// Check if device is online
const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected !== false && netInfo.isInternetReachable !== false;
};

export const supaUpdateWorkoutName = async (supabaseId: string, name: string): Promise<void> => {
    // Try to sync if online
    if(!(await isOnline())) {
        console.error("Could not update workout name in Supabase, device is offline");
        return;
    }

    try {
        const { error } = await supabase
            .from("workouts")
            .update({ name })
            .eq("id", supabaseId);
        if (error) throw error;
    } catch (err) {
        console.error("Error updating workout in Supabase:", err);
    }
};