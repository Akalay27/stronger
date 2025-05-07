import React, { useState } from "react";
import { TextInput, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Modal } from "./Modal";
import { useThemeColor } from "@/hooks/useThemeColor";

interface Props {
    visible: boolean;
    onClose: () => void;
    onStart: (exerciseName: string) => void;
}

export const StartExerciseModal: React.FC<Props> = ({ visible, onClose, onStart }) => {
    const [exerciseName, setExerciseName] = useState("");
    const backgroundColor = useThemeColor(
        { light: "#F2F2F7", dark: "#2C2C2E" },
        "secondaryBackground",
    );
    const textColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");
    const accentColor = useThemeColor({ light: "#007AFF", dark: "#0A84FF" }, "tint");

    const handleStart = () => {
        if (exerciseName.trim()) {
            onStart(exerciseName.trim());
            setExerciseName("");
        }
    };

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            title="Enter Workout Name"
            showCloseButton={false}
        >
            <TextInput
                style={[styles.input, { backgroundColor, color: textColor }]}
                value={exerciseName}
                onChangeText={setExerciseName}
                placeholder="e.g. Bench Press"
                placeholderTextColor="#999"
            />
            <TouchableOpacity
                onPress={handleStart}
                style={[styles.startButton, { backgroundColor: accentColor }]}
            >
                <Text style={styles.startText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={[styles.closeText, { color: accentColor }]}>Cancel</Text>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
        marginBottom: 16,
    },
    startButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginBottom: 10,
        width: "100%",
        alignItems: "center",
    },
    startText: {
        color: "#fff",
        fontWeight: "600",
    },
    closeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    closeText: {
        fontWeight: "500",
    },
});
