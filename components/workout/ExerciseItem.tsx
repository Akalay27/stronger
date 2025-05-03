import React, { useState } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { Button, Icon } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Exercise, WorkoutSet } from '@/lib/database';
import SetItem from './SetItem';
import AddSetForm from './AddSetForm';
import { IconSymbol } from '../ui/IconSymbol';

interface ExerciseWithSets extends Exercise {
    sets: WorkoutSet[];
}

interface ExerciseItemProps {
    exercise: ExerciseWithSets;
    onDeleteExercise: (exerciseId: number) => void;
    onAddSet: (exerciseId: number, weight: string, reps: string) => void;
    onSetCompletion: (setId: number, completed: boolean) => void;
    onDeleteSet: (setId: number) => void;
}

export const ExerciseItem: React.FC<ExerciseItemProps> = ({
    exercise,
    onDeleteExercise,
    onAddSet,
    onSetCompletion,
    onDeleteSet,
}) => {
    const [addingSet, setAddingSet] = useState(false);

    const handleAddSet = (weight: string, reps: string) => {
        onAddSet(exercise.id, weight, reps);
        setAddingSet(false);
    };

    return (
        <ThemedView style={styles.exerciseItem}>
            <View style={styles.exerciseHeader}>
                <ThemedText type="subtitle">{exercise.type}</ThemedText>
                <Button
                    type="clear"
                    icon={<IconSymbol name="trash" size={22} color="red" />}
                    onPress={() => onDeleteExercise(exercise.id)}
                    containerStyle={{ marginLeft: 'auto' }}
                />
            </View>

            {/* Render sets for this exercise */}
            {exercise.sets.length > 0 ? (
                <FlatList
                    data={exercise.sets}
                    keyExtractor={(set) => set.id.toString()}
                    renderItem={({ item: set }) => (
                        <SetItem set={set} onComplete={onSetCompletion} onDelete={onDeleteSet} />
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
                <AddSetForm onAddSet={handleAddSet} onCancel={() => setAddingSet(false)} />
            ) : (
                <Button
                    onPress={() => setAddingSet(true)}
                    type="outline"
                    icon={<IconSymbol name="plus" size={20} color="#1e88e5" />}
                    iconPosition="left"
                    buttonStyle={{ borderColor: '#1e88e5', marginTop: 8 }}
                    titleStyle={{ color: '#1e88e5' }}
                />
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    exerciseItem: {
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    noSetsText: {
        fontStyle: 'italic',
        color: '#999',
        marginVertical: 8,
    },
});

export default ExerciseItem;
