import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";

import { useThemeColor } from "@/hooks/useThemeColor";

import { Title } from "@/components/Title";
import { VerticalSpacer } from "@/components/VerticalSpacer";

import { AddProgressPicture } from "@/components/ui/AddProgressPicture";
import { GoalSlider } from "@/components/ui/GoalSlider";
import { InfoContainer } from "@/components/ui/InfoContainer";
import { ProgressPictureGallery } from "@/components/ui/ProgressPictureGallery";
import { TemplateManagementModal } from "@/components/TemplateManagementModal";

import {
    initDatabase,
    getActiveWorkout,
    createWorkout,
    Workout,
    getAllWorkouts,
    WorkoutWithExerciseList,
    deleteWorkout,
    updateWorkoutName,
    createFromTemplate,
    getAllWorkoutsWithData,
} from "@/lib/database";

export default function JournalScreen() {
    // TODO: Add more days when the bottom of the infinite scroll is reached
    const [days, setDays] = useState<Date[]>([]);
    const [progressPictures, setProgressPictures] = useState<Record<string, MediaLibrary.Asset[]>>(
        {},
    );
    const [loading, setLoading] = useState(true);
    const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
    const [showStartModal, setShowStartModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<WorkoutWithExerciseList | null>(null);
    const [workouts, setWorkouts] = useState<WorkoutWithExerciseList[]>([]);

    const insets = useSafeAreaInsets();

    const backgroundColor = useThemeColor({ light: "", dark: "" }, "background");

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
            await getWorkouts(); // Refresh templates
        } catch (error) {
            console.error("Error updating template:", error);
            Alert.alert("Error", "Failed to update template. Please try again.");
        }
    };

    const handleDeleteTemplate = async (id: number) => {
        try {
            await deleteWorkout(id);
            await getWorkouts(); // Refresh templates
        } catch (error) {
            console.error("Error deleting template:", error);
            Alert.alert("Error", "Failed to delete template. Please try again.");
        }
    };

    const getWorkouts = async () => {
        try {
            const res = await getAllWorkoutsWithData();
            setWorkouts(res);
        } catch (error) {
            console.error("Error fetching workout templates:", error);
        }
    };

    useEffect(() => {
        console.log(workouts);

        const days: Date[] = [];

        for(let i = 0; i < workouts.length; i++) {
            const currentWorkout: Workout = workouts[i];

            const day = new Date(currentWorkout["start_time"])

            days.push(day);
        }

        setDays(days);
    }, [workouts]);

    // Initialize database and check for active workout
    useEffect(() => {
        const setup = async () => {
            try {
                await initDatabase();
                await checkActiveWorkout();
                await getWorkouts();
            } catch (error) {
                console.error("Error setting up database:", error);
            } finally {
                setLoading(false);
            }
        };
        setup();
    }, []);

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

            <Title type="h1">Journal</Title>

            <VerticalSpacer gap={20} />

            <Title type="h2" lightColor="#888888">
                Goals
            </Title>

            <VerticalSpacer gap={20} />

            <View style={styles.verticalContainer}>
                <GoalSlider
                    leftValue={140}
                    progress={0.5}
                    rightValue={180}
                    titleText="Body Weight"
                    units="lbs"
                />
                <GoalSlider
                    leftValue={180}
                    progress={0.9}
                    rightValue={183}
                    titleText="Height"
                    units="cm"
                />
            </View>

            <VerticalSpacer gap={20} />

            {days &&
                days.map((day, index) => {
                    return (
                        <View key={"journal-entry-" + index.toString()}>
                            <Title type="h2" lightColor="#888888">
                                {day.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </Title>

                            <VerticalSpacer gap={20} />

                            <View style={styles.horizontalContainer}>
                                {progressPictures[day.toLocaleDateString("en-US")] && (
                                    <ProgressPictureGallery
                                        progressPictures={
                                            progressPictures[day.toLocaleDateString("en-US")]
                                        }
                                    />
                                )}
                                {day.toLocaleDateString("en-US") ===
                                    new Date().toLocaleDateString("en-US") && (
                                    <AddProgressPicture callback={setProgressPictures} />
                                )}
                            </View>

                            <VerticalSpacer gap={20} />

                            <View style={styles.horizontalContainer}>
                                {workouts[index] && 
                                    <InfoContainer
                                        descriptionText={workouts[index].exerciseList.join(", ")}
                                        moreInfoOnPress={() => handleOpenTemplateModal(workouts[index])}
                                        onPress={() => handleStartTemplate(workouts[index])}
                                        titleText={workouts[index].name}
                                    />
                                }
                            </View>

                            <VerticalSpacer gap={40} />
                        </View>
                    );
                })}
        </Animated.ScrollView>
    );
}

const styles = StyleSheet.create({
    horizontalContainer: {
        flexDirection: "row",

        gap: 10,

        marginLeft: 10,
        marginRight: 10,
    },
    verticalContainer: {
        flexDirection: "column",

        gap: 10,

        marginLeft: 10,
        marginRight: 10,
    },
});
