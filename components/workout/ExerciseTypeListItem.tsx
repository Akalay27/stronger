import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ExerciseType } from "@/lib/databases/db-types";
import { IconSymbol } from "../ui/IconSymbol";

interface ExerciseTypeListItemProps {
    exercise: ExerciseType;
    onSelect?: () => void;
    isSelected?: boolean;
    onHelp?: () => void;
}

export const ExerciseTypeListItem: React.FC<ExerciseTypeListItemProps> = ({
    exercise,
    onSelect,
    isSelected,
    onHelp,
}) => {
    return (
        <TouchableOpacity
            style={[styles.container, isSelected && styles.selected]}
            onPress={onSelect}
        >
            {/* <Image source={{ uri: exercise.imageUrl }} style={styles.image} /> */}
            <View style={styles.info}>
                <Text style={styles.name}>{exercise.name}</Text>
                <Text style={styles.category}>
                    {capitalize(exercise.primaryMuscles.join(", "))}
                </Text>
            </View>

            {isSelected ? (
                <IconSymbol name="checkmark" size={15} color="#4caf50" style={styles.check} />
            ) : (
                <TouchableOpacity onPress={onHelp} style={[styles.helpIcon]}>
                    <IconSymbol name="info" size={15} color="#888" />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderBottomWidth: 0.5,
        borderColor: "#444",
    },
    helpIcon: {
        marginLeft: "auto",
        padding: 2,
        borderRadius: 10,
        backgroundColor: "#ffffff",
    },
    selected: {
        backgroundColor: "#e0e0ff",
    },
    image: {
        width: 40,
        height: 40,
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    name: {
        fontWeight: "600",
    },
    category: {},
    check: {
        marginRight: 3,
    },
});
