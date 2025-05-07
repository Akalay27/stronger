import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
} from "react-native";
import { Modal } from "../Modal";
import { useThemeColor } from "@/hooks/useThemeColor";

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
    const textColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            title={exerciseName}
            closeButtonText="Close"
        >
            <ScrollView
                style={styles.content}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {instructions.map((step, index) => (
                    <Text key={index} style={[styles.instruction, { color: textColor }]}>
                        • {step}
                    </Text>
                ))}
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    content: {
        width: "100%",
        marginBottom: 20,
        maxHeight: 300,
    },
    instruction: {
        fontSize: 16,
        marginBottom: 8,
    },
});