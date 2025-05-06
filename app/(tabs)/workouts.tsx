import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";

import { useThemeColor } from "@/hooks/useThemeColor";

// TODO: Combine container elements into one
import { VerticalSpacer } from "@/components/VerticalSpacer";
import { Title } from "@/components/Title";

import { GenerateButton } from "@/components/ui/GenerateButton";
import { InfoContainer } from "@/components/ui/InfoContainer";
import { StartButton } from "@/components/ui/StartButton";

export default function WorkoutsScreen() {
    const insets = useSafeAreaInsets();

    const backgroundColor = useThemeColor({ light: "", dark: "" }, "background");

    return (
        <Animated.ScrollView
            style={{
                backgroundColor: backgroundColor,
                paddingTop: insets.top + 90,
            }}
        >
            <Title type="h1">Edit Workouts</Title>

            <VerticalSpacer gap={20} />

            <Title type="h2" lightColor="#888888">
                New Workout
            </Title>

            <VerticalSpacer gap={20} />

            <View
                style={[
                    styles.container,
                    {
                        flexDirection: "row",
                    },
                ]}
            >
                <StartButton titleText="From Scratch" icon="plus" />
                <GenerateButton titleText="From Preset" />
            </View>

            <VerticalSpacer gap={20} />

            <Title type="h2" lightColor="#888888">
                Stored Templates
            </Title>

            <VerticalSpacer gap={20} />

            <View style={styles.container}>
                <InfoContainer
                    descriptionText="Leg Extension, Squat (Barbell), Calf Raise on Leg Press"
                    timerText="2 days ago"
                    titleText="Legs and Core"
                />

                <InfoContainer
                    descriptionText="Lat Pulldowns, Drag Curls, Cable Rows, Bayesian Curls, Dumbbell Curls"
                    timerText="5 days ago"
                    titleText="Back and Bis"
                />
            </View>
        </Animated.ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 10,

        marginLeft: 10,
        marginRight: 10,
    },
});
