import React, { useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import { Button } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '../ui/IconSymbol';

// List of exercise types for the dropdown
export const EXERCISE_TYPES = [
    'Bench Press',
    'Squat',
    'Deadlift',
    'Shoulder Press',
    'Pull-up',
    'Barbell Row',
    'Bicep Curl',
    'Tricep Extension',
    'Leg Press',
    'Lat Pulldown',
    'Other',
];

interface ExerciseTypeSelectorProps {
    onAddExercise: () => void;
    selectedExerciseType: string;
    setSelectedExerciseType: (type: string) => void;
}

export const ExerciseTypeSelector: React.FC<ExerciseTypeSelectorProps> = ({
    onAddExercise,
    selectedExerciseType,
    setSelectedExerciseType,
}) => {
    const [showExerciseTypeDropdown, setShowExerciseTypeDropdown] = useState(false);
    const [selectedTypeIndex, setSelectedTypeIndex] = useState(
        EXERCISE_TYPES.indexOf(selectedExerciseType),
    );

    const renderExerciseTypeDropdown = () => {
        if (!showExerciseTypeDropdown) return null;

        return (
            <ThemedView style={styles.dropdown}>
                <FlatList
                    data={EXERCISE_TYPES}
                    keyExtractor={(item) => item}
                    renderItem={({ item, index }) => (
                        <ThemedText
                            style={[
                                styles.dropdownItem,
                                index === selectedTypeIndex && styles.selectedDropdownItem,
                            ]}
                            onPress={() => {
                                setSelectedExerciseType(item);
                                setSelectedTypeIndex(index);
                                setShowExerciseTypeDropdown(false);
                            }}
                        >
                            {item}
                        </ThemedText>
                    )}
                />
            </ThemedView>
        );
    };

    return (
        <ThemedView style={styles.addExerciseContainer}>
            <ThemedText type="subtitle">Add Exercise</ThemedText>

            <ThemedView style={styles.exerciseTypeSelector}>
                <TouchableOpacity
                    style={styles.selectContainer}
                    onPress={() => setShowExerciseTypeDropdown(!showExerciseTypeDropdown)}
                >
                    <ThemedText>{selectedExerciseType}</ThemedText>
                    <Ionicons
                        name={showExerciseTypeDropdown ? 'chevron-up' : 'chevron-down'}
                        size={24}
                    />
                </TouchableOpacity>
                {renderExerciseTypeDropdown()}

                <Button
                    title="Add Exercise"
                    onPress={onAddExercise}
                    icon={<IconSymbol name="plus" size={16} color="white" />}
                    iconPosition="left"
                    buttonStyle={{ backgroundColor: '#1e88e5', marginLeft: 8 }}
                />
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    addExerciseContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        zIndex: 2,
    },
    exerciseTypeSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        zIndex: 3,
    },
    selectContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 8,
    },
    dropdown: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        maxHeight: 200,
        zIndex: 3,
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedDropdownItem: {
        backgroundColor: '#f0f0f0',
    },
});

export default ExerciseTypeSelector;
