import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Platform,
    KeyboardAvoidingView,
    Alert,
    View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
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
} from '@/lib/database';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import our custom components

import ExerciseTypeSelector, { EXERCISE_TYPES } from '@/components/workout/ExerciseTypeSelector';
import ExerciseItem from '@/components/workout/ExerciseItem';
import CustomHeader from '@/components/workout/CustomHeader';
import { ThemedText } from '@/components/ThemedText';
import useElapsedTime from '@/hooks/useElapsedTime';

type ExerciseWithSets = Exercise & {
    sets: WorkoutSet[];
};

export default function ActiveWorkoutScreen() {
    const { workoutId } = useLocalSearchParams();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [exercises, setExercises] = useState<ExerciseWithSets[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const elapsedTime = useElapsedTime(workout?.start_time ?? 0);
    // For adding new exercises
    const [selectedExerciseType, setSelectedExerciseType] = useState(EXERCISE_TYPES[0]);

    const insets = useSafeAreaInsets();

    // Initialize the database and load workout data
    useEffect(() => {
        const setup = async () => {
            try {
                await initDatabase();
                await loadWorkoutData();
            } catch (error) {
                console.error('Error setting up database:', error);
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
            console.error('No workout ID provided');
            return;
        }

        try {
            // Get workout details
            const activeWorkout = await getActiveWorkout();
            if (!activeWorkout || activeWorkout.id !== Number(workoutId)) {
                Alert.alert('Error', 'Workout not found or not active');
                router.back();
                return;
            }
            setWorkout(activeWorkout);

            // Get exercises for this workout
            const workoutExercises = await getExercisesByWorkout(Number(workoutId));

            // For each exercise, get its sets
            const exercisesWithSets: ExerciseWithSets[] = await Promise.all(
                workoutExercises.map(async (exercise) => {
                    const sets = await getSetsByExercise(exercise.id);
                    return { ...exercise, sets };
                }),
            );

            setExercises(exercisesWithSets);
        } catch (error) {
            console.error('Error loading workout data:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await loadWorkoutData();
        } catch (error) {
            console.error('Error refreshing workout data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleAddExercise = async () => {
        if (!workoutId) return;

        try {
            await addExercise(Number(workoutId), selectedExerciseType);
            // Reload data
            await loadWorkoutData();
        } catch (error) {
            console.error('Error adding exercise:', error);
        }
    };

    const handleAddSet = async (exerciseId: number, weight: string, reps: string) => {
        if (!weight || !reps) {
            Alert.alert('Error', 'Please enter weight and reps');
            return;
        }

        try {
            await addSet(exerciseId, parseFloat(weight), parseInt(reps, 10), false);
            // Reload data
            await loadWorkoutData();
        } catch (error) {
            console.error('Error adding set:', error);
        }
    };

    const handleSetCompletion = async (setId: number, completed: boolean) => {
        try {
            await updateSetCompletion(setId, !completed);
            // Reload data
            await loadWorkoutData();
        } catch (error) {
            console.error('Error updating set completion:', error);
        }
    };

    const handleDeleteExercise = async (exerciseId: number) => {
        Alert.alert(
            'Delete Exercise',
            'Are you sure you want to delete this exercise and all its sets?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            await deleteExercise(exerciseId);
                            // Reload data
                            await loadWorkoutData();
                        } catch (error) {
                            console.error('Error deleting exercise:', error);
                        }
                    },
                    style: 'destructive',
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
            console.error('Error deleting set:', error);
        }
    };

    const handleFinishWorkout = async () => {
        if (!workoutId) return;

        Alert.alert('Finish Workout', 'Are you sure you want to finish this workout?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Finish',
                onPress: async () => {
                    try {
                        // End the workout in the database
                        await endWorkout(Number(workoutId));

                        // Use back() instead of replace to avoid navigation issues
                        router.back();
                    } catch (error) {
                        console.error('Error finishing workout:', error);
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <>
                <CustomHeader title="Current Workout" onEndWorkout={() => {}} />
                <ThemedView style={[styles.container, styles.centered]}>
                    <ActivityIndicator size="large" />
                </ThemedView>
            </>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <CustomHeader
                title={workout?.name || 'Current Workout'}
                onEndWorkout={handleFinishWorkout}
            />

            <ThemedView style={styles.workoutInfo}>
                <ThemedText>{elapsedTime}</ThemedText>
            </ThemedView>

            <ExerciseTypeSelector
                selectedExerciseType={selectedExerciseType}
                setSelectedExerciseType={setSelectedExerciseType}
                onAddExercise={handleAddExercise}
            />

            <FlatList
                data={exercises}
                renderItem={({ item }) => (
                    <ExerciseItem
                        exercise={item}
                        onDeleteExercise={handleDeleteExercise}
                        onAddSet={handleAddSet}
                        onSetCompletion={handleSetCompletion}
                        onDeleteSet={handleDeleteSet}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <ThemedView style={styles.emptyContainer}>
                        <ThemedText>
                            No exercises added yet. Add your first exercise above!
                        </ThemedText>
                    </ThemedView>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    emptyContainer: {
        padding: 16,
        alignItems: 'center',
    },
    workoutInfo: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});
