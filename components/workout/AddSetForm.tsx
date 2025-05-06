import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Button } from "@rneui/themed";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

interface AddSetFormProps {
    onAddSet: (weight: string, reps: string) => void;
    onCancel: () => void;
}

export const AddSetForm: React.FC<AddSetFormProps> = ({ onAddSet, onCancel }) => {
    const [weight, setWeight] = useState("");
    const [reps, setReps] = useState("");

    const handleSubmit = () => {
        onAddSet(weight, reps);
        setWeight("");
        setReps("");
    };

    return (
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
                    onPress={onCancel}
                    type="outline"
                    buttonStyle={{ borderColor: "#f44336" }}
                    titleStyle={{ color: "#f44336" }}
                    containerStyle={{ flex: 1, marginRight: 8 }}
                />
                <Button
                    title="Add Set"
                    onPress={handleSubmit}
                    disabled={!weight || !reps}
                    containerStyle={{ flex: 1 }}
                />
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
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
});

export default AddSetForm;
