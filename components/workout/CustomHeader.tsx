import React from "react";
import { StyleSheet, View, TouchableOpacity, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { router } from "expo-router";
import { IconSymbol } from "../ui/IconSymbol";

interface CustomHeaderProps {
    title: string;
    rightButtonText?: string;
    onRightButton: () => void;
    rightButtonDisabled?: boolean;
    leftButtonText?: string;
    onLeftButton?: () => void;
    leftButtonDisabled?: boolean;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({
    title,
    rightButtonText,
    onRightButton: onEndWorkout,
    rightButtonDisabled,
    leftButtonText,
    onLeftButton,
    leftButtonDisabled,
}) => {
    const insets = useSafeAreaInsets();

    return (
        <ThemedView
            style={[
                styles.container,
                {
                    paddingTop: Platform.OS === "ios" ? insets.top : StatusBar.currentHeight || 0,
                },
            ]}
        >
            <View style={styles.sideContainer}>
                {leftButtonText && onLeftButton ? (
                    <TouchableOpacity onPress={onLeftButton}>
                        <ThemedText
                            style={
                                (styles.backText,
                                leftButtonDisabled ? styles.endTextDisabled : styles.backText)
                            }
                        >
                            {leftButtonText}
                        </ThemedText>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => router.back()}>
                        <IconSymbol name="chevron.left" size={24} color="#1e88e5" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.titleContainer}>
                <ThemedText style={styles.title}>{title}</ThemedText>
            </View>

            <View style={styles.sideContainer}>
                <TouchableOpacity onPress={onEndWorkout} disabled={rightButtonDisabled}>
                    <ThemedText
                        style={
                            (styles.endText,
                            rightButtonDisabled ? styles.endTextDisabled : styles.endText)
                        }
                    >
                        {rightButtonText}
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: Platform.OS === "ios" ? 90 : 60,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    backText: {
        color: "#1e88e5",
        fontSize: 16,
    },
    titleContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    sideContainer: {
        width: 60,
        justifyContent: "center",
        // Change this:
        alignItems: "flex-start", // Align to the left within the space
        paddingLeft: 0, // optional, ensure no extra space
        marginLeft: 0, // optional, prevent default inset
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
    },

    endButton: {
        paddingHorizontal: 20,
        paddingVertical: 4,
    },
    endText: {
        color: "#1e88e5",
        fontSize: 16,
        textAlign: "right",
    },
    endTextDisabled: {
        color: "#ccc",
    },
});

export default CustomHeader;
