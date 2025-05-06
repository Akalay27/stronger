import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import * as MediaLibrary from "expo-media-library";

import { useThemeColor } from '@/hooks/useThemeColor';

import { Title } from '@/components/Title';
import { VerticalSpacer } from '@/components/VerticalSpacer';

import { AddProgressPicture } from "@/components/ui/AddProgressPicture";
import { GoalSlider } from '@/components/ui/GoalSlider';
import { InfoContainer } from "@/components/ui/InfoContainer";
import { ProgressPictureGallery } from '@/components/ui/ProgressPictureGallery';

export default function JournalScreen() {
    // TODO: Add more days when the bottom of the infinite scroll is reached
    const [days, setDays] = useState<Date[]>([]);
    const [progressPictures, setProgressPictures] = useState<Record<string, MediaLibrary.Asset[]>>({});

    const insets = useSafeAreaInsets();

    const backgroundColor = useThemeColor({ light: "", dark: "" }, "background");

    useEffect(() => {
        const currentDate = new Date();

        // Increment the length property of Array.from just before the bottom of the infinite scroll
        const lastTenDays = Array.from({ length: 10 }, (_, i) => {
            const date = new Date(currentDate);

            date.setDate(date.getDate() - i);

            return date;
        });

        setDays(lastTenDays);
    }, []);

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

            {days && days.map((day, index) => {
                return (
                    <View key={"journal-entry-" + index.toString()}>
                        <Title type='h2' lightColor='#888888'>
                            {day.toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})}
                        </Title>

                        <VerticalSpacer gap={20}/>

                        <View style={styles.horizontalContainer}>
                            {progressPictures[day.toLocaleDateString("en-US")] &&
                                <ProgressPictureGallery
                                    progressPictures={progressPictures[day.toLocaleDateString("en-US")]}
                                />
                            }
                            {day.toLocaleDateString("en-US") === new Date().toLocaleDateString("en-US") &&
                                <AddProgressPicture
                                    callback={setProgressPictures}
                                />
                            }
                        </View>

                        <VerticalSpacer gap={20}/>

                        <View style={styles.horizontalContainer}>
                            <InfoContainer
                                descriptionText="Leg Extension, Squat (Barbell), Calf Raise on Leg Press"
                                titleText="Legs and Core"
                            />
                        </View>

                        <VerticalSpacer gap={40}/>
                    </View>
                );
            })}
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