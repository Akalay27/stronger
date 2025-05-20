import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { WorkoutSet } from "@/lib/databases/db-types";

interface SetItemProps {
    set: WorkoutSet;
    onComplete: (setId: number, completed: boolean) => void;
    onDelete: (setId: number) => void;
    isTemplate?: boolean;
}

export const SetItem: React.FC<SetItemProps> = ({ set, onComplete, onDelete, isTemplate = false }) => {
    return (
        <Swipeable
            renderRightActions={() => (
                <TouchableOpacity style={styles.deleteSwipe} onPress={() => onDelete(set.id)}>
                    <Ionicons name="trash-outline" size={24} color="#fff" />
                </TouchableOpacity>
            )}
        >
            <ThemedView style={styles.setRow}>
                {!isTemplate && (
                    <TouchableOpacity
                        style={styles.checkbox}
                        onPress={() => onComplete(set.id, set.completed)}
                    >
                        <Ionicons
                            name={set.completed ? "checkmark-circle" : "ellipse-outline"}
                            size={24}
                            color={set.completed ? "#4CAF50" : "#999"}
                        />
                    </TouchableOpacity>
                )}
                <ThemedText style={styles.setText}>
                    {set.weight} lb × {set.reps}
                </ThemedText>
            </ThemedView>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    setRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    checkbox: {
        marginRight: 10,
    },
    setText: {
        flex: 1,
        fontSize: 16,
    },
    deleteSwipe: {
        backgroundColor: "#f44336",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingHorizontal: 20,
        borderRadius: 8,
        height: "100%",
    },
});

export default SetItem;
