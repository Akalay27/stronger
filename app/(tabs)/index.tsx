import React, { useState, useEffect, useCallback } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";
import Animated from "react-native-reanimated";

import { PrimaryContainer } from "@/components/PrimaryContainer";
import { Title } from "@/components/Title";

import { Workout, WorkoutWithExerciseList } from "@/lib/databases/db-types";
import { initDatabase } from "@/lib/databases/sqlite/setup";

import { createFromTemplate, createWorkout } from "@/lib/databases/sqlite/workouts/create";
import { getActiveWorkout, getAllTemplates } from "@/lib/databases/sqlite/workouts/read";
import { updateWorkoutName } from "@/lib/databases/sqlite/workouts/update";
import { deleteWorkout } from "@/lib/databases/sqlite/workouts/delete";

import { ThemedView } from "@/components/ThemedView";
import { VerticalSpacer } from "@/components/VerticalSpacer";
import { GenerateButton } from "@/components/ui/GenerateButton";
import { InfoContainer } from "@/components/ui/InfoContainer";
import { StartButton } from "@/components/ui/StartButton";
import { StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StartExerciseModal } from "@/components/StartWorkoutModal";
import { ContainerTitle } from "@/components/ContainerTitle";
import { ContainerDescription } from "@/components/ContainerDescription";
import { TemplateManagementModal } from "@/components/TemplateManagementModal";

export default function WorkoutsScreen() {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
    const [showStartModal, setShowStartModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<WorkoutWithExerciseList | null>(null);
    const backgroundColor = useThemeColor({ light: "", dark: "" }, "background");

    const [templates, setTemplates] = useState<WorkoutWithExerciseList[]>([]);
    // Initialize database and check for active workout
    useEffect(() => {
        const setup = async () => {
            try {
                await initDatabase();
                await checkActiveWorkout();
                await getTemplates();
            } catch (error) {
                console.error("Error setting up database:", error);
            } finally {
                setLoading(false);
            }
        };
        setup();
    }, []);

    // Update workout data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            // Only check if we're not already loading
            if (!loading) {
                checkActiveWorkout();
                getTemplates();
            }
        }, [loading]),
    );

    const getTemplates = async () => {
        try {
            const templates = await getAllTemplates();
            setTemplates(templates);
        } catch (error) {
            console.error("Error fetching workout templates:", error);
        }
    };

    const checkActiveWorkout = async () => {
        try {
            const workout = await getActiveWorkout();
            setActiveWorkout(workout);
        } catch (error) {
            console.error("Error checking active workout:", error);
        }
    };

    const handleStartWorkout = async (name: string) => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter a workout name");
            return;
        }

        try {
            // Create the workout
            const workoutId = await createWorkout(name.trim());

            // Reset the input field
            checkActiveWorkout(); // Refresh active workout state
            setShowStartModal(false);
            // Navigate to active workout screen with the workout ID
            router.push({
                pathname: "/active",
                params: { workoutId },
            });
        } catch (error) {
            console.error("Error creating workout:", error);
            Alert.alert("Error", "Failed to create workout. Please try again.");
        }
    };

    const handleResumeWorkout = () => {
        if (activeWorkout) {
            router.push({
                pathname: "/active",
                params: { workoutId: activeWorkout.id },
            });
        }
    };

    const handleOpenTemplateModal = (template: WorkoutWithExerciseList) => {
        setSelectedTemplate(template);
        setShowTemplateModal(true);
    };

    const handleStartTemplate = async (template: WorkoutWithExerciseList) => {
        try {
            // Make sure there is not an active workout
            if (activeWorkout) {
                Alert.alert(
                    "Error",
                    "Please finish or resume your current workout before starting a template.",
                );
                return;
            }
            // Create a new workout based on the template
            const workoutId = await createFromTemplate(template.id);
            // Navigate to active workout screen with the new workout ID
            router.push({
                pathname: "/active",
                params: { workoutId },
            });
        } catch (error) {
            console.error("Error starting workout from template:", error);
            Alert.alert("Error", "Failed to start workout from template. Please try again.");
        }
    };

    const handleUpdateTemplateName = async (id: number, newName: string) => {
        try {
            await updateWorkoutName(id, newName);
            await getTemplates(); // Refresh templates
        } catch (error) {
            console.error("Error updating template:", error);
            Alert.alert("Error", "Failed to update template. Please try again.");
        }
    };

    const handleDeleteTemplate = async (id: number) => {
        try {
            await deleteWorkout(id);
            await getTemplates(); // Refresh templates
        } catch (error) {
            console.error("Error deleting template:", error);
            Alert.alert("Error", "Failed to delete template. Please try again.");
        }
    };

    if (loading) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </ThemedView>
        );
    }

    return (
        <Animated.ScrollView
            style={{
                backgroundColor: backgroundColor,
                paddingTop: insets.top + 90,
            }}
        >
            <StartExerciseModal
                onStart={handleStartWorkout}
                visible={showStartModal}
                onClose={() => setShowStartModal(false)}
            />
            <TemplateManagementModal
                visible={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
                template={selectedTemplate}
                onSave={handleUpdateTemplateName}
                onDelete={handleDeleteTemplate}
            />
            <Title type="h1">Start a Workout</Title>

            <VerticalSpacer gap={20} />
            {activeWorkout ? (
                <ThemedView style={{ paddingLeft: 10, paddingRight: 10 }}>
                    <PrimaryContainer onPress={handleResumeWorkout}>
                        <ContainerTitle>Resume Workout</ContainerTitle>
                        <ContainerDescription>{activeWorkout.name}</ContainerDescription>
                    </PrimaryContainer>
                </ThemedView>
            ) : (
                <>
                    <Title type="h2" lightColor="#888888">
                        Get Started
                    </Title>

                    <VerticalSpacer gap={20} />

                    <View style={[styles.container]}>
                        <StartButton onPress={() => setShowStartModal(true)} />
                        <GenerateButton />
                    </View>
                </>
            )}

            <VerticalSpacer gap={20} />

            <Title type="h2" lightColor="#888888">
                Stored Templates
            </Title>

            <VerticalSpacer gap={20} />

            <View style={styles.templatesContainer}>
                {Array.from({ length: Math.ceil(templates.length / 2) }).map((_, rowIndex) => (
                    <View key={rowIndex} style={styles.templateRow}>
                        {templates.slice(rowIndex * 2, rowIndex * 2 + 2).map((template) => (
                            <InfoContainer
                                key={template.id}
                                descriptionText={template.exerciseList.join(", ")}
                                titleText={template.name}
                                onPress={() => handleStartTemplate(template)}
                                moreInfoOnPress={() => handleOpenTemplateModal(template)}
                                style={{ flex: 1 }}
                            />
                        ))}
                    </View>
                ))}
            </View>
        </Animated.ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",

        gap: 10,

        marginLeft: 10,
        marginRight: 10,
    },

    templatesContainer: {
        paddingHorizontal: 10,
    },
    templateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        gap: 10,
    },
});
