import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";

interface Props {
    visible: boolean;
    onClose: () => void;
    onStart: (exerciseName: string) => void;
}

export const StartExerciseModal: React.FC<Props> = ({ visible, onClose, onStart }) => {
    const [exerciseName, setExerciseName] = useState("");

    const handleStart = () => {
        if (exerciseName.trim()) {
            onStart(exerciseName.trim());
            setExerciseName("");
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.title}>Enter Exercise Name</Text>
                        <TextInput
                            style={styles.input}
                            value={exerciseName}
                            onChangeText={setExerciseName}
                            placeholder="e.g. Bench Press"
                        />
                        <TouchableOpacity onPress={handleStart} style={styles.startButton}>
                            <Text style={styles.startText}>Start</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        width: "90%",
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
        marginBottom: 16,
    },
    startButton: {
        backgroundColor: "#007AFF",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginBottom: 10,
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
        color: "#007AFF",
        fontWeight: "500",
    },
});
