import { supabase } from "@/lib/databases/supabase/setup";
import NetInfo from "@react-native-community/netinfo";

// Check if device is online
const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected !== false && netInfo.isInternetReachable !== false;
};

// Update a set
export const supaUpdateSet = async (supabaseId: string, weight: number, reps: number): Promise<void> => {
    if(!(await isOnline())) {
        console.error("Could not update set in Supabase, device is offline");
        return;
    }

    try {
        const { error } = await supabase
            .from("sets")
            .update({ weight, reps })
            .eq("id", supabaseId);
        if (error) throw error;
    } catch (err) {
        console.error("Error updating set in Supabase:", err);
    }
};

// Update a set's completion status
export const supaUpdateSetCompletion = async (supabaseId: string, completed: boolean): Promise<void> => {
    if(!(await isOnline())) {
        console.error("Could not update set completion in Supabase, device is offline");
        return;
    }

    try {
        const { error } = await supabase
            .from("sets")
            .update({ completed })
            .eq("id", supabaseId);
        if (error) throw error;
    } catch (err) {
        console.error("Error updating set in Supabase:", err);
    }
};