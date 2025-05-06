import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    instructions: string[];
    exerciseName: string;
}

export const ExerciseInstructionsModal: React.FC<Props> = ({
    visible,
    onClose,
    instructions,
    exerciseName,
}) => {
    return (
        <Modal visible={visible} animationType="fade" transparent>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modal}>
                            <Text style={styles.title}>{exerciseName}</Text>
                            <ScrollView
                                style={styles.content}
                                contentContainerStyle={{ flexGrow: 1 }}
                            >
                                {instructions.map((step, index) => (
                                    <Text key={index} style={styles.instruction}>
                                        • {step}
                                    </Text>
                                ))}
                            </ScrollView>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        width: '90%',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    content: {
        marginBottom: 20,
    },
    instruction: {
        fontSize: 16,
        marginBottom: 8,
    },
    closeButton: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    closeText: {
        fontWeight: '500',
    },
});
