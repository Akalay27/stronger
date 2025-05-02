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
} from "react-native";
import { useFocusEffect } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import {
  initDatabase,
  getAllWorkoutSets,
  addWorkoutSet,
  deleteWorkoutSet,
  syncUnsyncedSets,
  WorkoutSet,
} from "@/lib/database";
import { Button } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";

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

export default function WorkoutsScreen() {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exerciseType, setExerciseType] = useState(EXERCISE_TYPES[0]);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [showExerciseTypeDropdown, setShowExerciseTypeDropdown] =
    useState(false);

  // Initialize the database and load sets
  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        await loadSets();
      } catch (error) {
        console.error("Error setting up database:", error);
      } finally {
        setLoading(false);
      }
    };
    setup();
  }, []);

  // Reload sets when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSets();
      syncUnsyncedSets().catch((error) =>
        console.error("Error syncing unsynced sets:", error)
      );
    }, [])
  );

  const loadSets = async () => {
    try {
      const workoutSets = await getAllWorkoutSets();
      setSets(workoutSets);
    } catch (error) {
      console.error("Error loading workout sets:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncUnsyncedSets();
      await loadSets();
    } catch (error) {
      console.error("Error refreshing workout sets:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddSet = async () => {
    if (!exerciseType || !weight || !reps) {
      return; // Don't add if fields are empty
    }

    try {
      await addWorkoutSet(exerciseType, parseFloat(weight), parseInt(reps, 10));
      // Reset form fields
      setWeight("");
      setReps("");
      // Reload sets
      await loadSets();
    } catch (error) {
      console.error("Error adding workout set:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteWorkoutSet(id);
      // Reload sets
      await loadSets();
    } catch (error) {
      console.error("Error deleting workout set:", error);
    }
  };

  // Render each workout set
  const renderItem = ({ item }: { item: WorkoutSet }) => (
    <ThemedView style={styles.setItem}>
      <View style={styles.setContent}>
        <ThemedText type="subtitle">{item.exercise_type}</ThemedText>
        <ThemedText>
          {item.weight} lbs × {item.reps} reps
        </ThemedText>
        <ThemedText style={styles.date}>
          {new Date(item.created_at).toLocaleString()}
          {!item.synced && " (Not synced)"}
        </ThemedText>
      </View>
      <Button
        type="clear"
        icon={<Ionicons name="trash-outline" size={24} color="red" />}
        onPress={() => handleDelete(item.id)}
      />
    </ThemedView>
  );

  // Renders the exercise type selector
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
                setExerciseType(item);
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
      <ThemedView style={styles.formContainer}>
        <ThemedText type="subtitle">Add New Set</ThemedText>

        {/* Exercise Type Selector */}
        <ThemedView style={styles.inputContainer}>
          <ThemedText>Exercise Type:</ThemedText>
          <ThemedView
            style={styles.selectContainer}
            onTouchEnd={() =>
              setShowExerciseTypeDropdown(!showExerciseTypeDropdown)
            }
          >
            <ThemedText>{exerciseType}</ThemedText>
            <Ionicons
              name={showExerciseTypeDropdown ? "chevron-up" : "chevron-down"}
              size={24}
            />
          </ThemedView>
          {renderExerciseTypeDropdown()}
        </ThemedView>

        {/* Weight Input */}
        <ThemedView style={styles.inputContainer}>
          <ThemedText>Weight (lbs):</ThemedText>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="Enter weight"
          />
        </ThemedView>

        {/* Reps Input */}
        <ThemedView style={styles.inputContainer}>
          <ThemedText>Reps:</ThemedText>
          <TextInput
            style={styles.input}
            value={reps}
            onChangeText={setReps}
            keyboardType="numeric"
            placeholder="Enter reps"
          />
        </ThemedView>

        {/* Add Button */}
        <Button
          title="Add Set"
          onPress={handleAddSet}
          buttonStyle={styles.addButton}
          disabled={!exerciseType || !weight || !reps}
        />
      </ThemedView>

      <FlatList
        data={sets}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>
              No workout sets found. Add your first set above!
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
  formContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    zIndex: 1,
  },
  inputContainer: {
    marginVertical: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  selectContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  dropdown: {
    position: "absolute",
    top: 74,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    maxHeight: 200,
    zIndex: 2,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedDropdownItem: {
    backgroundColor: "#f0f0f0",
  },
  addButton: {
    marginTop: 16,
    backgroundColor: "#1e88e5",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  setItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  setContent: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    marginTop: 4,
    color: "#999",
  },
  emptyContainer: {
    padding: 16,
    alignItems: "center",
  },
});
