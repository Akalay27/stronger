import React, { useState, useEffect, useCallback } from "react";
import { ActivityIndicator, Alert, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFocusEffect, useNavigation } from "expo-router";
import Animated from "react-native-reanimated";

import { PrimaryContainer } from "@/components/PrimaryContainer";
import { Title } from "@/components/Title";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@rneui/themed";
import { initDatabase, getActiveWorkout, createWorkout, Workout } from "@/lib/database";
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

export default function WorkoutsScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
    const [showNameInput, setShowNameInput] = useState(false);
    const [showStartModal, setShowStartModal] = useState(false);
    const backgroundColor = useThemeColor({ light: "", dark: "" }, "background");
    // Initialize database and check for active workout
    useEffect(() => {
        const setup = async () => {
            try {
                await initDatabase();
                await checkActiveWorkout();
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
            }
        }, [loading]),
    );

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

            <View style={styles.container}>
                <InfoContainer
                    descriptionText="Leg Extension, Squat (Barbell), Calf Raise on Leg Press"
                    timerText="2 days ago"
                    titleText="Legs and Core"
                />

                <InfoContainer
                    descriptionText="Lat Pulldowns, Drag Curls, Cable Rows, Bayesian Curls, Dumbbell Curls"
                    timerText="5 days ago"
                    titleText="Back and Bis"
                />
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
});
