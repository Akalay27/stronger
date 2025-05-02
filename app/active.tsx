import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  View,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
  SectionList,
  TouchableOpacity,
} from "react-native";
import {
  useFocusEffect,
  useLocalSearchParams,
  router,
  useNavigation,
} from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
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
} from "@/lib/database";
import { Button } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { Spacer } from "@/components/Spacer";
import { Title } from "@/components/Title";

// List of exercise types for the dropdown
const EXERCISE_TYPES = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Shoulder Press",
  "Pull-up",
  "Barbell Row",
  "Bicep Curl",
  "Tricep Extension",
  "Leg Press",
  "Lat Pulldown",
  "Other",
];

type ExerciseWithSets = Exercise & {
  sets: WorkoutSet[];
};

export default function ActiveWorkoutScreen() {
  const { workoutId } = useLocalSearchParams();
  const navigation = useNavigation();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<ExerciseWithSets[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // For adding new exercises
  const [showExerciseTypeDropdown, setShowExerciseTypeDropdown] =
    useState(false);
  const [selectedExerciseType, setSelectedExerciseType] = useState(
    EXERCISE_TYPES[0]
  );
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);

  // For adding new sets
  const [addingSetForExerciseId, setAddingSetForExerciseId] = useState<
    number | null
  >(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

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
    }, [workoutId])
  );

  // We don't need a separate listener for navigation
  // The useFocusEffect in workouts.tsx will handle refreshing data

  const loadWorkoutData = async () => {
    if (!workoutId) {
      console.error("No workout ID provided");
      return;
    }

    try {
      // Get workout details
      const activeWorkout = await getActiveWorkout();
      if (!activeWorkout || activeWorkout.id !== Number(workoutId)) {
        Alert.alert("Error", "Workout not found or not active");
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
        })
      );

      setExercises(exercisesWithSets);
    } catch (error) {
      console.error("Error loading workout data:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadWorkoutData();
    } catch (error) {
      console.error("Error refreshing workout data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddExercise = async () => {
    if (!workoutId) return;

    try {
      await addExercise(Number(workoutId), selectedExerciseType);
      // Reset form
      setShowExerciseTypeDropdown(false);
      // Reload data
      await loadWorkoutData();
    } catch (error) {
      console.error("Error adding exercise:", error);
    }
  };

  const handleAddSet = async (exerciseId: number) => {
    if (!weight || !reps) {
      Alert.alert("Error", "Please enter weight and reps");
      return;
    }

    try {
      await addSet(exerciseId, parseFloat(weight), parseInt(reps, 10), false);

      // Reset form
      setWeight("");
      setReps("");
      setAddingSetForExerciseId(null);

      // Reload data
      await loadWorkoutData();
    } catch (error) {
      console.error("Error adding set:", error);
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
      ]
    );
  };

  const handleDeleteSet = async (setId: number) => {
    Alert.alert("Delete Set", "Are you sure you want to delete this set?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteSet(setId);
            // Reload data
            await loadWorkoutData();
          } catch (error) {
            console.error("Error deleting set:", error);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleFinishWorkout = async () => {
    if (!workoutId) return;

    Alert.alert(
      "Finish Workout",
      "Are you sure you want to finish this workout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Finish",
          onPress: async () => {
            try {
              // End the workout in the database
              await endWorkout(Number(workoutId));

              // Use back() instead of replace to avoid navigation issues
              router.back();
            } catch (error) {
              console.error("Error finishing workout:", error);
            }
          },
        },
      ]
    );
  };

  const renderExerciseItem = ({ item }: { item: ExerciseWithSets }) => (
    <ThemedView style={styles.exerciseItem}>
      <View style={styles.exerciseHeader}>
        <ThemedText type="subtitle">{item.type}</ThemedText>
        <Button
          type="clear"
          icon={<Ionicons name="trash-outline" size={22} color="red" />}
          onPress={() => handleDeleteExercise(item.id)}
          containerStyle={{ marginLeft: "auto" }}
        />
      </View>

      {/* Render sets for this exercise */}
      {item.sets.length > 0 ? (
        <FlatList
          data={item.sets}
          keyExtractor={(set) => set.id.toString()}
          renderItem={({ item: set }) => (
            <ThemedView style={styles.setRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleSetCompletion(set.id, set.completed)}
              >
                <Ionicons
                  name={set.completed ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={set.completed ? "#4CAF50" : "#999"}
                />
              </TouchableOpacity>
              <ThemedText style={{ flex: 1 }}>
                {set.weight} lbs × {set.reps} reps
              </ThemedText>
              <Button
                type="clear"
                icon={<Ionicons name="trash-outline" size={20} color="red" />}
                onPress={() => handleDeleteSet(set.id)}
              />
            </ThemedView>
          )}
          scrollEnabled={false}
        />
      ) : (
        <ThemedText style={styles.noSetsText}>
          No sets added yet. Add your first set below.
        </ThemedText>
      )}

      {/* Add set form or button */}
      {addingSetForExerciseId === item.id ? (
        <ThemedView style={styles.addSetForm}>
          <ThemedView style={styles.setInputRow}>
            <ThemedView style={styles.setInputContainer}>
              <ThemedText>Weight (lbs):</ThemedText>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="Enter weight"
              />
            </ThemedView>
            <ThemedView style={styles.setInputContainer}>
              <ThemedText>Reps:</ThemedText>
              <TextInput
                style={styles.input}
                value={reps}
                onChangeText={setReps}
                keyboardType="numeric"
                placeholder="Enter reps"
              />
            </ThemedView>
          </ThemedView>
          <View style={styles.addSetButtons}>
            <Button
              title="Cancel"
              onPress={() => setAddingSetForExerciseId(null)}
              type="outline"
              buttonStyle={{ borderColor: "#f44336" }}
              titleStyle={{ color: "#f44336" }}
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Add Set"
              onPress={() => handleAddSet(item.id)}
              disabled={!weight || !reps}
              containerStyle={{ flex: 1 }}
            />
          </View>
        </ThemedView>
      ) : (
        <Button
          title="Add Set"
          onPress={() => setAddingSetForExerciseId(item.id)}
          type="outline"
          icon={
            <Ionicons name="add-circle-outline" size={16} color="#1e88e5" />
          }
          iconPosition="left"
          buttonStyle={{ borderColor: "#1e88e5", marginTop: 8 }}
          titleStyle={{ color: "#1e88e5" }}
        />
      )}
    </ThemedView>
  );

  const renderExerciseTypeDropdown = () => {
    if (!showExerciseTypeDropdown) return null;

    return (
      <ThemedView style={styles.dropdown}>
        <FlatList
          data={EXERCISE_TYPES}
          keyExtractor={(item) => item}
          renderItem={({ item, index }) => (
            <ThemedText
              style={[
                styles.dropdownItem,
                index === selectedTypeIndex && styles.selectedDropdownItem,
              ]}
              onPress={() => {
                setSelectedExerciseType(item);
                setSelectedTypeIndex(index);
                setShowExerciseTypeDropdown(false);
              }}
            >
              {item}
            </ThemedText>
          )}
        />
      </ThemedView>
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <ThemedView style={styles.header}>
        <Title type="h2">{workout?.name || "Active Workout"}</Title>
        <ThemedText>
          Started:{" "}
          {workout ? new Date(workout.start_time).toLocaleString() : ""}
        </ThemedText>
        <Button
          title="Finish Workout"
          onPress={handleFinishWorkout}
          buttonStyle={{ backgroundColor: "#4CAF50", marginTop: 8 }}
        />
      </ThemedView>

      <ThemedView style={styles.addExerciseContainer}>
        <ThemedText type="subtitle">Add Exercise</ThemedText>

        <ThemedView style={styles.exerciseTypeSelector}>
          <ThemedView
            style={styles.selectContainer}
            onTouchEnd={() =>
              setShowExerciseTypeDropdown(!showExerciseTypeDropdown)
            }
          >
            <ThemedText>{selectedExerciseType}</ThemedText>
            <Ionicons
              name={showExerciseTypeDropdown ? "chevron-up" : "chevron-down"}
              size={24}
            />
          </ThemedView>
          {renderExerciseTypeDropdown()}

          <Button
            title="Add Exercise"
            onPress={handleAddExercise}
            icon={
              <Ionicons name="add-circle-outline" size={16} color="white" />
            }
            iconPosition="left"
            buttonStyle={{ backgroundColor: "#1e88e5", marginLeft: 8 }}
          />
        </ThemedView>
      </ThemedView>

      <FlatList
        data={exercises}
        renderItem={renderExerciseItem}
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
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  addExerciseContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    zIndex: 2,
  },
  exerciseTypeSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    zIndex: 3,
  },
  selectContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
  },
  dropdown: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    maxHeight: 200,
    zIndex: 3,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedDropdownItem: {
    backgroundColor: "#f0f0f0",
  },
  listContent: {
    padding: 16,
  },
  exerciseItem: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
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
  noSetsText: {
    fontStyle: "italic",
    color: "#999",
    marginVertical: 8,
  },
  addSetForm: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  setInputRow: {
    flexDirection: "row",
  },
  setInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  addSetButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
  emptyContainer: {
    padding: 16,
    alignItems: "center",
  },
});
