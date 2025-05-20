import { supabase } from "@/lib/databases/supabase/setup";
import NetInfo from "@react-native-community/netinfo";

// Check if device is online
const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected !== false && netInfo.isInternetReachable !== false;
};

export const supaDeleteExercise = async (supabaseId: string): Promise<void> => {
    if(!(await isOnline())) {
        console.error("Could not delete exercise from Supbase, device is offline");
        return;
    }

    try {
        const { error } = await supabase
            .from("exercises")
            .delete()
            .eq("id", supabaseId);
        if (error) throw error;
    } catch (err) {
        console.error("Error deleting exercise from Supabase:", err);
    }
}