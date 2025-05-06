import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";

import { useThemeColor } from "@/hooks/useThemeColor";

import { Title } from "@/components/Title";

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();

    const backgroundColor = useThemeColor({ light: "", dark: "" }, "background");

    return (
        <Animated.ScrollView
            style={{
                backgroundColor: backgroundColor,
                paddingTop: insets.top + 90,
            }}
        >
            <Title type="h1">Settings</Title>
        </Animated.ScrollView>
    );
}
