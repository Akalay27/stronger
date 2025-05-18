import { supabase } from "@/lib/databases/supabase/setup";
import NetInfo from "@react-native-community/netinfo";

// Check if device is online
const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected !== false && netInfo.isInternetReachable !== false;
};

// Update the order of an exercise
export const supaUpdateExerciseOrder = async (supabaseId: string, newOrder: number): Promise<void> => {
    // Try to sync if online
    if (await isOnline()) {
        console.error("Could not update exercise order, device is not online");
        return;
    }

    try {
        const { error } = await supabase
            .from("exercises")
            .update({ order: newOrder })
            .eq("id", supabaseId);
        if (error) throw error;
    } catch (err) {
        console.error("Error updating exercise order in Supabase:", err);
    }
};