import React, { useState } from "react";
import { StyleSheet, FlatList, View, TouchableOpacity } from "react-native";
import { Button, Icon } from "@rneui/themed";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Exercise, WorkoutSet } from "@/lib/database";
import SetItem from "./SetItem";
import AddSetForm from "./AddSetForm";
import { IconSymbol } from "../ui/IconSymbol";
import { ExerciseWithSetsAndTypeName } from "@/app/active";

interface ExerciseItemProps {
    exercise: ExerciseWithSetsAndTypeName;
    onDeleteExercise: (exerciseId: number) => void;
    onAddSet: (exerciseId: number, weight: string, reps: string) => void;
    onSetCompletion: (setId: number, completed: boolean) => void;
    onDeleteSet: (setId: number) => void;
    onHelp: () => void;
    isTemplate?: boolean;
    isReorderMode?: boolean;
    onMoveUp?: (exerciseId: number) => void;
    onMoveDown?: (exerciseId: number) => void;
    isFirst?: boolean;
    isLast?: boolean;
}

export const ExerciseItem: React.FC<ExerciseItemProps> = ({
    exercise,
    onDeleteExercise,
    onAddSet,
    onSetCompletion,
    onDeleteSet,
    onHelp,
    isTemplate = false,
    isReorderMode = false,
    onMoveUp,
    onMoveDown,
    isFirst = false,
    isLast = false,
}) => {
    const [addingSet, setAddingSet] = useState(false);

    const handleAddSet = (weight: string, reps: string) => {
        onAddSet(exercise.id, weight, reps);
        setAddingSet(false);
    };

    return (
        <View style={styles.container}>
            <ThemedView style={styles.exerciseItem}>
                <View style={[styles.exerciseHeader]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {isReorderMode && (
                            <View style={styles.reorderButtons}>
                                <TouchableOpacity
                                    onPress={() => onMoveUp && onMoveUp(exercise.id)}
                                    disabled={isFirst}
                                    style={[styles.reorderButton, isFirst && styles.disabledButton]}
                                >
                                    <IconSymbol
                                        name="chevron.up"
                                        size={20}
                                        color={isFirst ? "#ccc" : "#1e88e5"}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => onMoveDown && onMoveDown(exercise.id)}
                                    disabled={isLast}
                                    style={[styles.reorderButton, isLast && styles.disabledButton]}
                                >
                                    <IconSymbol
                                        name="chevron.down"
                                        size={20}
                                        color={isLast ? "#ccc" : "#1e88e5"}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                        <ThemedText type="subtitle" style={{ flexShrink: 1 }} ellipsizeMode="tail">
                            {exercise.type_name}
                        </ThemedText>
                        {!isReorderMode && (
                            <TouchableOpacity onPress={onHelp} style={styles.helpIcon}>
                                <IconSymbol name="info" size={15} color="#888" />
                            </TouchableOpacity>
                        )}
                    </View>
                    {!isReorderMode && (
                        <Button
                            type="clear"
                            icon={<IconSymbol name="trash" size={22} color="red" />}
                            onPress={() => onDeleteExercise(exercise.id)}
                            containerStyle={{ marginLeft: "auto" }}
                            disabled={isReorderMode}
                        />
                    )}
                </View>

                {!isReorderMode && (
                    <>
                        {/* Render sets for this exercise */}
                        {exercise.sets.length > 0 ? (
                            <FlatList
                                data={exercise.sets}
                                keyExtractor={(set) => set.id.toString()}
                                renderItem={({ item: set }) => (
                                    <SetItem
                                        set={set}
                                        onComplete={onSetCompletion}
                                        onDelete={onDeleteSet}
                                        isTemplate={isTemplate}
                                    />
                                )}
                                scrollEnabled={false}
                            />
                        ) : (
                            <ThemedText style={styles.noSetsText}>
                                No sets added yet. Add your first set below.
                            </ThemedText>
                        )}

                        {/* Add set form or button */}
                        {addingSet ? (
                            <AddSetForm
                                onAddSet={handleAddSet}
                                onCancel={() => setAddingSet(false)}
                            />
                        ) : (
                            <Button
                                onPress={() => setAddingSet(true)}
                                type="outline"
                                icon={<IconSymbol name="plus" size={20} color="#1e88e5" />}
                                iconPosition="left"
                                buttonStyle={{ borderColor: "#1e88e5", marginTop: 8 }}
                                titleStyle={{ color: "#1e88e5" }}
                            />
                        )}
                    </>
                )}
            </ThemedView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        marginBottom: 16,
    },
    exerciseItem: {
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    exerciseHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    reorderHeader: {
        backgroundColor: "#f8f8f8",
        paddingVertical: 12,
        borderRadius: 8,
    },
    reorderButtons: {
        flexDirection: "row",
        marginRight: 6,
    },
    reorderButton: {
        padding: 8,
        marginHorizontal: 1,
    },
    disabledButton: {
        opacity: 0.5,
    },
    noSetsText: {
        fontStyle: "italic",
        color: "#999",
        marginVertical: 8,
    },
    helpIcon: {
        padding: 2,
        borderRadius: 10,
        backgroundColor: "#ffffff",
    },
});

export default ExerciseItem;
