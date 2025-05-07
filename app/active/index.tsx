import React, { useState, useCallback, useEffect } from "react";
import {
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Platform,
    KeyboardAvoidingView,
    Alert,
    View,
} from "react-native";
import { Button } from "@rneui/themed";
import { useFocusEffect, useLocalSearchParams, router } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import {
    initDatabase,
    getActiveWorkout,
    getExercisesByWorkout,
    getSetsByExercise,
    addExercise,
    addSet,
    updateSetCompletion,
    deleteExercise,
    deleteSet,
    endWorkout,
    Exercise,
    WorkoutSet,
    Workout,
    ExerciseType,
    getExerciseTypes,
    getExerciseTypeById,
    updateSet,
    deleteWorkout,
    getWorkout,
    syncWorkoutById,
} from "@/lib/database";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomHeader from "@/components/workout/CustomHeader";
import { ThemedText } from "@/components/ThemedText";
import useElapsedTime from "@/hooks/useElapsedTime";
import { Ionicons } from "@expo/vector-icons";
import { IconSymbol } from "@/components/ui/IconSymbol";
import ExerciseItem from "@/components/workout/ExerciseItem";
import { ExerciseInstructionsModal } from "@/components/workout/ExerciseInstructionsModal";

export type ExerciseWithSetsAndTypeName = Exercise & {
    sets: WorkoutSet[];
    type_name: string;
};

export default function ActiveWorkoutScreen() {
    const { workoutId } = useLocalSearchParams();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [exercises, setExercises] = useState<ExerciseWithSetsAndTypeName[]>([]);
    const [loading, setLoading] = useState(true);
    const [helpInstructionsVisible, setHelpInstructionsVisible] = useState(false);
    const [helpModalExercise, setHelpModalExercise] = useState<ExerciseType | null>(null);
    const elapsedTime = useElapsedTime(workout?.start_time ?? 0);

    // Initialize the database and load workout data
    useEffect(() => {
        const setup = async () => {
            try {
                await initDatabase();
                await loadWorkoutData();
            } catch (error) {
                console.error("Error setting up database:", error);
            } finally {
                setLoading(false);
            }
        };
        setup();
    }, [workoutId]);

    // Reload workout data when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            if (workoutId) {
                loadWorkoutData();
            }
        }, [workoutId]),
    );

    const loadWorkoutData = async () => {
        if (!workoutId) {
            console.error("No workout ID provided");
            return;
        }

        try {
            // Get workout details
            const workout = await getWorkout(Number(workoutId));
            if (!workout) {
                console.error("Workout not found");
                return;
            }
            setWorkout(workout);

            // Get exercises for this workout
            const workoutExercises = await getExercisesByWorkout(Number(workoutId));

            // For each exercise, get its sets and type name
            const exercisesWithSets: ExerciseWithSetsAndTypeName[] = await Promise.all(
                workoutExercises.map(async (exercise) => {
                    const sets = await getSetsByExercise(exercise.id);
                    const exerciseType = await getExerciseTypeById(exercise.type);
                    return { ...exercise, sets, type_name: exerciseType?.name || "Unknown" };
                }),
            );

            setExercises(exercisesWithSets);
        } catch (error) {
            console.error("Error loading workout data:", error);
        }
    };

    const handleAddExercise = async () => {
        if (!workoutId) return;

        // try {
        //     await addExercise(Number(workoutId), selectedExerciseType);
        //     // Reload data
        //     await loadWorkoutData();
        // } catch (error) {
        //     console.error('Error adding exercise:', error);
        // }

        router.push({
            pathname: "/active/add-exercise",
            params: { workoutId },
        });
    };

    const handleAddSet = async (exerciseId: number, weight: string, reps: string) => {
        try {
            await addSet(exerciseId, parseFloat(weight), parseInt(reps, 10), false);
            // Reload data
            await loadWorkoutData();
        } catch (error) {
            console.error("Error adding set:", error);
        }
    };

    const handleUpdateSet = async (setId: number, weight: string, reps: string) => {
        try {
            await updateSet(setId, parseFloat(weight), parseInt(reps, 10));
            // Reload data
            await loadWorkoutData();
        } catch (error) {
            console.error("Error updating set:", error);
        }
    };

    const handleSetCompletion = async (setId: number, completed: boolean) => {
        try {
            await updateSetCompletion(setId, !completed);
            // Reload data
            await loadWorkoutData();
        } catch (error) {
            console.error("Error updating set completion:", error);
        }
    };

    const handleDeleteExercise = async (exerciseId: number) => {
        Alert.alert(
            "Delete Exercise",
            "Are you sure you want to delete this exercise and all its sets?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            await deleteExercise(exerciseId);
                            // Reload data
                            await loadWorkoutData();
                        } catch (error) {
                            console.error("Error deleting exercise:", error);
                        }
                    },
                    style: "destructive",
                },
            ],
        );
    };

    const handleDeleteSet = async (setId: number) => {
        try {
            await deleteSet(setId);
            // Reload data
            await loadWorkoutData();
        } catch (error) {
            console.error("Error deleting set:", error);
        }
    };

    const handleFinishWorkout = async () => {
        if (workout?.is_template) {
            handleSaveWorkout();
            return;
        }
        if (!workoutId) return;

        // If no sets, ask if they want to cancel the workout
        if (exercises.every((exercise) => exercise.sets.length === 0)) {
            Alert.alert(
                "No Sets",
                "You have not added any sets. Do you want to cancel the workout?",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                    {
                        text: "Finish",
                        onPress: async () => {
                            try {
                                await deleteWorkout(Number(workoutId));
                                router.push({
                                    pathname: "/(tabs)",
                                    params: { workoutId },
                                });
                            } catch (error) {
                                console.error("Error finishing workout:", error);
                            }
                        },
                    },
                ],
            );
            return;
        }
        Alert.alert("Finish Workout", "Are you sure you want to finish this workout?", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Finish",
                onPress: async () => {
                    try {
                        // End the workout in the database
                        await endWorkout(Number(workoutId), false);

                        router.push({
                            pathname: "/active/finish-workout",
                            params: { workoutId },
                        });
                    } catch (error) {
                        console.error("Error finishing workout:", error);
                    }
                },
            },
        ]);
    };

    const handleSaveWorkout = async () => {
        if (!workoutId) return;
        try {
            syncWorkoutById(Number(workoutId));
            router.push({
                pathname: "/(tabs)",
                params: { workoutId },
            });
        } catch (error) {
            console.error("Error saving workout:", error);
        }
    };

    if (loading) {
        return (
            <>
                <CustomHeader title="Current Workout" onRightButton={() => {}} />
                <ThemedView style={[styles.container, styles.centered]}>
                    <ActivityIndicator size="large" />
                </ThemedView>
            </>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={100}
        >
            <CustomHeader
                title={workout?.name || "Current Workout"}
                rightButtonText={workout?.is_template ? "Save" : "Finish"}
                onRightButton={handleFinishWorkout}
            />

            {!workout?.is_template && (
                <ThemedView style={styles.workoutInfo}>
                    <ThemedText>{elapsedTime}</ThemedText>
                </ThemedView>
            )}

            <ExerciseInstructionsModal
                visible={helpInstructionsVisible}
                onClose={() => setHelpInstructionsVisible(false)}
                instructions={helpModalExercise?.instructions || []}
                exerciseName={helpModalExercise?.name || ""}
            />

            <FlatList
                data={exercises}
                renderItem={({ item, index }) =>
                    index != exercises.length - 1 ? (
                        <ExerciseItem
                            exercise={item}
                            onDeleteExercise={handleDeleteExercise}
                            onAddSet={handleAddSet}
                            onSetCompletion={handleSetCompletion}
                            onDeleteSet={handleDeleteSet}
                            isTemplate={workout?.is_template || false}
                            onHelp={async () => {
                                setHelpInstructionsVisible(true);
                                setHelpModalExercise(await getExerciseTypeById(item.type));
                            }}
                        />
                    ) : (
                        <>
                            <ExerciseItem
                                exercise={item}
                                onDeleteExercise={handleDeleteExercise}
                                onAddSet={handleAddSet}
                                onSetCompletion={handleSetCompletion}
                                onDeleteSet={handleDeleteSet}
                                isTemplate={workout?.is_template || false}
                                onHelp={async () => {
                                    setHelpInstructionsVisible(true);
                                    setHelpModalExercise(await getExerciseTypeById(item.type));
                                }}
                            />

                            <Button
                                title="Add Exercise"
                                onPress={handleAddExercise}
                                icon={<IconSymbol name="plus" size={16} color="white" />}
                                iconPosition="left"
                                containerStyle={{ margin: 16 }}
                            />
                        </>
                    )
                }
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                // refreshControl={
                //     <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                // }

                ListEmptyComponent={
                    <>
                        <ThemedView style={styles.emptyContainer}>
                            <ThemedText>
                                No exercises added yet. Add your first exercise below!
                            </ThemedText>
                        </ThemedView>
                        <Button
                            title="Add Exercise"
                            onPress={handleAddExercise}
                            icon={<IconSymbol name="plus" size={16} color="white" />}
                            iconPosition="left"
                            containerStyle={{ margin: 16 }}
                        />
                    </>
                }
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: "center",
        alignItems: "center",
    },
    listContent: {
        padding: 16,
    },
    emptyContainer: {
        padding: 16,
        alignItems: "center",
    },
    workoutInfo: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
});
