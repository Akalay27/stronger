import { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, Alert, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect, useNavigation } from 'expo-router';
import Animated from 'react-native-reanimated';

import { ContainerText } from '@/components/ContainerText';
import { PrimaryContainer } from '@/components/PrimaryContainer';
import { Spacer } from '@/components/Spacer';
import { Title } from '@/components/Title';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@rneui/themed';
import { initDatabase, getActiveWorkout, createWorkout, Workout } from '@/lib/database';
import { ThemedView } from '@/components/ThemedView';

export default function WorkoutsScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
    const [showNameInput, setShowNameInput] = useState(false);
    const [workoutName, setWorkoutName] = useState('');

    // Initialize database and check for active workout
    useEffect(() => {
        const setup = async () => {
            try {
                await initDatabase();
                await checkActiveWorkout();
            } catch (error) {
                console.error('Error setting up database:', error);
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
            console.error('Error checking active workout:', error);
        }
    };

    const handleStartWorkout = async () => {
        if (!workoutName.trim()) {
            Alert.alert('Error', 'Please enter a workout name');
            return;
        }

        try {
            // Create the workout
            const workoutId = await createWorkout(workoutName.trim());

            // Reset the input field
            setWorkoutName('');
            setShowNameInput(false);
            checkActiveWorkout(); // Refresh active workout state

            // Navigate to active workout screen with the workout ID
            router.push({
                pathname: '/active',
                params: { workoutId },
            });
        } catch (error) {
            console.error('Error creating workout:', error);
            Alert.alert('Error', 'Failed to create workout. Please try again.');
        }
    };

    const handleResumeWorkout = () => {
        if (activeWorkout) {
            router.push({
                pathname: '/active',
                params: { workoutId: activeWorkout.id },
            });
        }
    };

    if (loading) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </ThemedView>
        );
    }

    return (
        <Animated.ScrollView style={{ paddingTop: insets.top + 40 }}>
            <Title type="h1">Workouts</Title>
            <Spacer gap={20} />

            {activeWorkout ? (
                <>
                    <Title type="h2" lightColor="#888888">
                        Current Workout
                    </Title>
                    <Spacer gap={10} />
                    <PrimaryContainer>
                        <ThemedText type="subtitle">{activeWorkout.name}</ThemedText>
                        <ThemedText>
                            Started: {new Date(activeWorkout.start_time).toLocaleString()}
                        </ThemedText>
                        <Spacer gap={10} />
                        <Button
                            title="Resume Workout"
                            onPress={handleResumeWorkout}
                            buttonStyle={{ backgroundColor: '#4CAF50' }}
                        />
                    </PrimaryContainer>
                </>
            ) : (
                <>
                    <Title type="h2" lightColor="#888888">
                        Start a new workout
                    </Title>
                    <Spacer gap={10} />

                    {showNameInput ? (
                        <PrimaryContainer>
                            <ThemedText type="subtitle">Name your workout:</ThemedText>
                            <TextInput
                                style={{
                                    height: 40,
                                    borderWidth: 1,
                                    borderColor: '#ddd',
                                    borderRadius: 4,
                                    padding: 8,
                                    marginVertical: 10,
                                }}
                                value={workoutName}
                                onChangeText={setWorkoutName}
                                placeholder="e.g., Leg Day, Upper Body, etc."
                            />
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <Button
                                    title="Cancel"
                                    onPress={() => {
                                        setShowNameInput(false);
                                        setWorkoutName('');
                                    }}
                                    buttonStyle={{ backgroundColor: '#f44336' }}
                                    containerStyle={{ flex: 1 }}
                                />
                                <Button
                                    title="Start Workout"
                                    onPress={handleStartWorkout}
                                    disabled={!workoutName.trim()}
                                    containerStyle={{ flex: 1 }}
                                />
                            </View>
                        </PrimaryContainer>
                    ) : (
                        <PrimaryContainer>
                            <Button
                                title="Start New Workout"
                                onPress={() => setShowNameInput(true)}
                                buttonStyle={{ backgroundColor: '#1e88e5' }}
                            />
                        </PrimaryContainer>
                    )}
                </>
            )}

            <Spacer gap={20} />
            <Title type="h2" lightColor="#888888">
                Join a workout
            </Title>
            <Spacer gap={10} />
            <PrimaryContainer>
                <Button
                    title="Join Workout"
                    onPress={() => Alert.alert('Coming Soon', 'This feature is not yet available.')}
                    buttonStyle={{ backgroundColor: '#9C27B0' }}
                />
            </PrimaryContainer>
        </Animated.ScrollView>
    );
}
