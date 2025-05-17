import React, { useEffect, useState } from "react";
import {
    FlatList,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { ThemedView } from "@/components/ThemedView";
import CustomHeader from "@/components/workout/CustomHeader";

import { getExerciseTypes } from "@/lib/databases/sqlite/misc";
import { ExerciseType } from "@/lib/databases/db-types";

import { addExercises } from "@/lib/databases/sqlite/exercises/create";

import { ExerciseInstructionsModal } from "@/components/workout/ExerciseInstructionsModal";
import { router } from "expo-router";
import { ExerciseTypeListItem } from "@/components/workout/ExerciseTypeListItem";

export default function AddExerciseScreen() {
    const route = useRoute();
    const { workoutId } = route.params as { workoutId: number };
    const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [helpVisible, setHelpVisible] = useState(false);
    const [helpModalExercise, setHelpModalExercise] = useState<ExerciseType | null>(null);
    const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
    useEffect(() => {
        getExerciseTypes()
            .then(setExerciseTypes)
            .catch((error) => console.error("Error fetching exercise types:", error));
    }, []);

    const handleAddExercises = async () => {
        // Handle adding selected exercises to the workout
        console.log("Selected exercises:", selectedExercises);
        await addExercises(workoutId, selectedExercises);
        router.back();
    };

    const filteredExercises = exerciseTypes.filter((e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <KeyboardAvoidingView style={styles.container}>
            <CustomHeader
                title="New"
                rightButtonText="Add"
                onRightButton={handleAddExercises}
                rightButtonDisabled={selectedExercises.length === 0}
            />
            <ThemedView style={styles.searchRow}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </ThemedView>
            <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ExerciseTypeListItem
                        exercise={item}
                        isSelected={selectedExercises.includes(item.id)}
                        onSelect={() => {
                            if (selectedExercises.includes(item.id)) {
                                setSelectedExercises((prev) => prev.filter((id) => id !== item.id));
                            } else {
                                setSelectedExercises((prev) => [...prev, item.id]);
                            }
                        }}
                        onHelp={() => {
                            setHelpVisible(true);
                            setHelpModalExercise(item);
                        }}
                    />
                )}
            />
            <ExerciseInstructionsModal
                visible={helpVisible}
                onClose={() => setHelpVisible(false)}
                instructions={helpModalExercise?.instructions || []}
                exerciseName={helpModalExercise?.name || ""}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    searchRow: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    searchInput: {
        padding: 10,
        borderRadius: 8,
    },
    filterRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 8,
    },
    filterButton: {
        padding: 8,
        borderRadius: 8,
    },
});
