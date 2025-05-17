import React, { useEffect, useState } from "react";
// import ConfettiCannon from "react-native-confetti-cannon";
import { ExternalLink } from "@/components/ExternalLink";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { getWorkoutCount } from "@/lib/databases/sqlite/workouts/read";
import { endWorkout } from "@/lib/databases/sqlite/workouts/update";

import { useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { VerticalSpacer } from "@/components/VerticalSpacer";

export default function FinishWorkout() {
    const route = useRoute();
    const { workoutId } = route.params as { workoutId: number };
    const [numberOfWorkouts, setNumberOfWorkouts] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const fetchWorkoutCount = async () => {
            setShowConfetti(true);
            setNumberOfWorkouts(await getWorkoutCount());
        };
        fetchWorkoutCount();
    }, []);

    const handleFinishWorkout = async (template: boolean) => {
        try {
            await endWorkout(workoutId, template);
            router.push("/(tabs)");
        } catch (error) {
            console.error("Error finishing workout:", error);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container}>
            {/* {showConfetti && <ConfettiCannon count={200} origin={{ x: 0, y: 0 }} fadeOut />} */}

            <ThemedText type="title">Workout Finished!</ThemedText>
            <ThemedText type="defaultSemiBold">{numberOfWorkouts} workouts completed!</ThemedText>
            <VerticalSpacer gap={20} />
            <ThemedText type="default" style={{ textAlign: "center" }}>
                Your workout has been successfully completed.
            </ThemedText>
            <VerticalSpacer gap={20} />

            <ThemedView style={styles.actionRow}>
                {/* <Button title="Save Values" onPress={() => handleFinishWorkout(false)} />
                <Button title="Save as Template" onPress={() => handleFinishWorkout(true)} /> */}
            </ThemedView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%",
    },
});
