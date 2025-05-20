import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import { useFocusEffect, router } from "expo-router";

import { useThemeColor } from "@/hooks/useThemeColor";

import { VerticalSpacer } from "@/components/VerticalSpacer";
import { Title } from "@/components/Title";

import { GenerateButton } from "@/components/ui/GenerateButton";
import { InfoContainer } from "@/components/ui/InfoContainer";
import { StartButton } from "@/components/ui/StartButton";
import { TemplateManagementModal } from "@/components/TemplateManagementModal";

import { WorkoutWithExerciseList } from "@/lib/databases/db-types";

import { createFromTemplate } from "@/lib/databases/sqlite/workouts/create";
import { getAllTemplates } from "@/lib/databases/sqlite/workouts/read";
import { updateWorkoutName } from "@/lib/databases/sqlite/workouts/update";
import { deleteWorkout } from "@/lib/databases/sqlite/workouts/delete";

export default function WorkoutsScreen() {
    const insets = useSafeAreaInsets();
    const [templates, setTemplates] = useState<WorkoutWithExerciseList[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<WorkoutWithExerciseList | null>(null);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    
    const backgroundColor = useThemeColor({ light: "", dark: "" }, "background");

    const fetchTemplates = async () => {
        try {
            const templates = await getAllTemplates();
            setTemplates(templates);
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    };

    // Fetch templates when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchTemplates();
        }, [])
    );

    // Initial load
    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleOpenTemplateModal = (template: WorkoutWithExerciseList) => {
        setSelectedTemplate(template);
        setShowTemplateModal(true);
    };
    
    const handleUpdateTemplateName = async (id: number, newName: string) => {
        try {
            await updateWorkoutName(id, newName);
            await fetchTemplates(); // Refresh templates
        } catch (error) {
            console.error("Error updating template:", error);
            Alert.alert("Error", "Failed to update template. Please try again.");
        }
    };
    
    const handleDeleteTemplate = async (id: number) => {
        try {
            await deleteWorkout(id);
            await fetchTemplates(); // Refresh templates
        } catch (error) {
            console.error("Error deleting template:", error);
            Alert.alert("Error", "Failed to delete template. Please try again.");
        }
    };
    
    const handleStartTemplate = async (template: WorkoutWithExerciseList) => {
        try {
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

    return (
        <Animated.ScrollView
            style={{
                backgroundColor: backgroundColor,
                paddingTop: insets.top + 90,
            }}
        >
            <TemplateManagementModal
                visible={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
                template={selectedTemplate}
                onSave={handleUpdateTemplateName}
                onDelete={handleDeleteTemplate}
            />
            
            <Title type="h1">Edit Workouts</Title>

            <VerticalSpacer gap={20} />

            <Title type="h2" lightColor="#888888">
                New Workout
            </Title>

            <VerticalSpacer gap={20} />

            <View
                style={[
                    styles.container,
                    {
                        flexDirection: "row",
                    },
                ]}
            >
                <StartButton titleText="From Scratch" icon="plus" />
                <GenerateButton titleText="From Preset" />
            </View>

            <VerticalSpacer gap={20} />

            <Title type="h2" lightColor="#888888">
                Stored Templates
            </Title>

            <VerticalSpacer gap={20} />

            <View style={styles.container}>
                {templates.length > 0 ? (
                    templates.map((template) => (
                        <InfoContainer
                            key={template.id}
                            descriptionText={template.exerciseList.join(", ")}
                            titleText={template.name}
                            onPress={() => handleStartTemplate(template)}
                            moreInfoOnPress={() => handleOpenTemplateModal(template)}
                        />
                    ))
                ) : (
                    <InfoContainer
                        descriptionText="You haven't created any workout templates yet. Complete a workout and save it as a template to see it here."
                        titleText="No Templates"
                    />
                )}
            </View>
        </Animated.ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 10,
        marginLeft: 10,
        marginRight: 10,
    },
});