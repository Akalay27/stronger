import { supabase } from "@/lib/databases/supabase/setup";
import NetInfo from "@react-native-community/netinfo";

// Check if device is online
const isOnline = async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected !== false && netInfo.isInternetReachable !== false;
};

// Delete a workout set (legacy)
// export const deleteWorkoutSet = async (id: number): Promise<void> => {
//     const [set] = await db.getAllAsync<WorkoutSet>(`SELECT * FROM workout_sets WHERE id = ?`, [id]);

//     if (set?.supabase_id && (await isOnline())) {
//         try {
//             const { error } = await supabase
//                 .from("workout_sets")
//                 .delete()
//                 .eq("id", set.supabase_id);
//             if (error) throw error;
//         } catch (err) {
//             console.error("Error deleting from Supabase:", err);
//         }
//     }

//     await db.runAsync(`DELETE FROM workout_sets WHERE id = ?`, [id]);
// };

// Delete a set
export const supaDeleteSet = async (supabaseId: string): Promise<void> => {
    if (!(await isOnline())) {
        console.error("Could not delete set from Supabase, device is offline");
        return;
    }

    try {
        const { error } = await supabase.from("sets").delete().eq("id", supabaseId);
        if (error) throw error;
    } catch (err) {
        console.error("Error deleting set from Supabase:", err);
    }
};