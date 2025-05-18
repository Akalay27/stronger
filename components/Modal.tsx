import React, { ReactNode } from "react";
import {
    Modal as RNModal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    StyleProp,
    ViewStyle,
    TextStyle,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

interface ModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    showCloseButton?: boolean;
    closeButtonText?: string;
    containerStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    closeButtonStyle?: StyleProp<ViewStyle>;
    closeTextStyle?: StyleProp<TextStyle>;
}

export const Modal: React.FC<ModalProps> = ({
    visible,
    onClose,
    title,
    children,
    showCloseButton = true,
    closeButtonText = "Close",
    containerStyle,
    titleStyle,
    closeButtonStyle,
    closeTextStyle,
}) => {
    const backgroundColor = useThemeColor({ light: "#fff", dark: "#1c1c1e" }, "background");
    const textColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");
    const accentColor = useThemeColor({ light: "#007AFF", dark: "#0A84FF" }, "tint");

    return (
        <RNModal visible={visible} animationType="fade" transparent>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={[styles.modal, { backgroundColor }, containerStyle]}>
                            {title && (
                                <Text style={[styles.title, { color: textColor }, titleStyle]}>
                                    {title}
                                </Text>
                            )}
                            {children}
                            {showCloseButton && (
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={[styles.closeButton, closeButtonStyle]}
                                >
                                    <Text
                                        style={[
                                            styles.closeText,
                                            { color: accentColor },
                                            closeTextStyle,
                                        ]}
                                    >
                                        {closeButtonText}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </RNModal>
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
    closeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginTop: 12,
    },
    closeText: {
        fontWeight: "500",
    },
});
