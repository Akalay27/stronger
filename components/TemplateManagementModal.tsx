import React, { useState } from "react";
import { TextInput, StyleSheet, View, TouchableOpacity, Text, Alert } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Modal } from "./Modal";
import { WorkoutWithExerciseList, deleteWorkout } from "@/lib/database";
import { router } from "expo-router";

interface Props {
    visible: boolean;
    onClose: () => void;
    template: WorkoutWithExerciseList | null;
    onSave: (id: number, newName: string) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

export const TemplateManagementModal: React.FC<Props> = ({
    visible,
    onClose,
    template,
    onSave,
    onDelete,
}) => {
    const [name, setName] = useState("");
    const accentColor = useThemeColor({ light: "#007AFF", dark: "#0A84FF" }, "tint");
    const dangerColor = useThemeColor({ light: "#FF3B30", dark: "#FF453A" }, "error");
    const backgroundColor = useThemeColor({ light: "#F2F2F7", dark: "#2C2C2E" }, "background");
    const textColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");

    React.useEffect(() => {
        if (template) {
            setName(template.name);
        }
    }, [template]);

    const handleSave = async () => {
        if (!template) return;

        if (!name.trim()) {
            Alert.alert("Error", "Please enter a template name");
            return;
        }

        try {
            await onSave(template.id, name.trim());
            onClose();
        } catch (error) {
            console.error("Error updating template:", error);
            Alert.alert("Error", "Failed to update template. Please try again.");
        }
    };

    const handleDelete = () => {
        if (!template) return;

        Alert.alert("Delete Template", `Are you sure you want to delete "${template.name}"?`, [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await onDelete(template.id);
                        onClose();
                    } catch (error) {
                        console.error("Error deleting template:", error);
                        Alert.alert("Error", "Failed to delete template. Please try again.");
                    }
                },
            },
        ]);
    };

    const handleEditExercises = () => {
        if (!template) return;
        onClose();
        router.push({
            pathname: "/active",
            params: {
                workoutId: template.id,
            },
        });
    };

    if (!template) return null;

    return (
        <Modal visible={visible} onClose={onClose} title="Edit Template" showCloseButton={false}>
            <TextInput
                style={[styles.input, { backgroundColor, color: textColor }]}
                value={name}
                onChangeText={setName}
                placeholder="Template Name"
                placeholderTextColor="#999"
            />

            <View style={styles.exerciseList}>
                <Text style={[styles.exercisesTitle, { color: textColor }]}>Exercises:</Text>
                {template.exerciseList.map((exercise, index) => (
                    <Text key={index} style={[styles.exerciseItem, { color: textColor }]}>
                        • {exercise}
                    </Text>
                ))}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={handleEditExercises}
                    style={[styles.button, styles.editButton]}
                >
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.button, styles.saveButton, { backgroundColor: accentColor }]}
                >
                    <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={handleDelete}
                style={[styles.deleteButton, { borderColor: dangerColor }]}
            >
                <Text style={[styles.deleteButtonText, { color: dangerColor }]}>
                    Delete Template
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={[styles.deleteButton]}>
                <Text style={styles.buttonText}>Cancel</Text>
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
        fontSize: 16,
    },
    exerciseList: {
        width: "100%",
        marginBottom: 16,
    },
    exercisesTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    exerciseItem: {
        fontSize: 14,
        marginBottom: 4,
        paddingLeft: 8,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 16,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        minWidth: "45%",
        alignItems: "center",
    },
    buttonText: {
        fontWeight: "600",
    },
    editButton: {
        backgroundColor: "#f0f0f0",
    },
    saveButton: {
        backgroundColor: "#007AFF",
    },
    saveButtonText: {
        color: "white",
    },
    deleteButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        borderWidth: 1,
        width: "100%",
        alignItems: "center",
        marginTop: 8,
    },
    deleteButtonText: {
        fontWeight: "500",
    },
});
