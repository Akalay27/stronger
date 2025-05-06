import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/useThemeColor';

import { Title } from '@/components/Title';
import { VerticalSpacer } from '@/components/VerticalSpacer';

import { GoalSlider } from '@/components/ui/GoalSlider';
import { InfoContainer } from "@/components/ui/InfoContainer";

export default function JournalScreen() {
    const insets = useSafeAreaInsets();

    const backgroundColor = useThemeColor({ light: "", dark: "" }, "background");

    return (
        <Animated.ScrollView style={{
            backgroundColor: backgroundColor,
            paddingTop: insets.top + 90,
        }}>
            <Title type='h1'>Journal</Title>

            <VerticalSpacer gap={20}/>

            <Title type='h2' lightColor='#888888'>Goals</Title>

            <VerticalSpacer gap={20}/>

            <View style={styles.verticalContainer}>
                <GoalSlider
                    leftValue={2}
                    progress={0.1}
                    rightValue={8}
                    titleText="Penis Length"
                    units='"'
                />
                <GoalSlider
                    leftValue={140}
                    progress={0.5}
                    rightValue={180}
                    titleText="Body Weight"
                    units="lbs"
                />
                <GoalSlider
                    leftValue={180}
                    progress={0.9}
                    rightValue={183}
                    titleText="Height"
                    units="cm"
                />
            </View>

            <VerticalSpacer gap={20}/>

            <Title type='h2' lightColor='#888888'>Apr 28, 2025</Title>

            <VerticalSpacer gap={20}/>

            <View style={styles.horizontalContainer}>
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
    horizontalContainer: {
        flexDirection: 'row',

        gap: 10,

        marginLeft: 10,
        marginRight: 10,
    },
    verticalContainer: {
        flexDirection: 'column',

        gap: 10,

        marginLeft: 10,
        marginRight: 10,
    },
});