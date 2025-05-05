import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

// TODO: Combine container elements into one
import { Break } from '@/components/Break';
import { ContainerTitle } from '@/components/ContainerTitle';
import { ContainerDescription } from '@/components/ContainerDescription';
import { HorizontalSpacer } from '@/components/HorizontalSpacer';
import { MoreInfo } from '@/components/MoreInfo';
import { PrimaryContainer } from '@/components/PrimaryContainer';
import { VerticalSpacer } from '@/components/VerticalSpacer';
import { Title } from '@/components/Title';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function TabTwoScreen() {
    const insets = useSafeAreaInsets();

    const backgroundColor = useThemeColor({ light: "", dark: "" }, "background");
    const color = useThemeColor({ light: "", dark: "" }, "secondaryText");

    return (
        <Animated.ScrollView style={{
            backgroundColor: backgroundColor,
            paddingTop: insets.top + 90,
        }}>
            <Title type='h1'>Start a Workout</Title>

            <VerticalSpacer gap={20}/>

            <Title type='h2' lightColor='#888888'>Get Started</Title>

            <VerticalSpacer gap={20}/>

            <View style={[ styles.container ]}>
                <PrimaryContainer
                    mainColor={'primary'}
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                    }}
                >
                    <ContainerTitle
                        gradientLeft={'#23BECF'}
                        gradientRight={'#3535E2'}
                    >Start</ContainerTitle>
                    <VerticalSpacer gap={40}/>
                    <Break/>
                    <IconSymbol
                        color={color}
                        name="arrow.right"
                        size={40}
                    />
                </PrimaryContainer>

                <PrimaryContainer
                    mainColor={'secondary'}
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                    }}
                >
                    <ContainerTitle
                        gradientLeft={'#9B5DFF'}
                        gradientRight={'#EA00B0'}
                    >Generate</ContainerTitle>
                    <VerticalSpacer gap={40}/>
                    <Break/>
                    <IconSymbol
                        color={color}
                        name="sparkles"
                        size={40}
                    />
                </PrimaryContainer>
            </View>

            <VerticalSpacer gap={20}/>

            <Title type='h2' lightColor='#888888'>Stored Templates</Title>

            <VerticalSpacer gap={20}/>

            <View style={styles.container}>
                <PrimaryContainer
                    mainColor={'info'}
                    style={{ 
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        padding: 10,
                        paddingLeft: 10,
                    }}
                >
                    <ContainerTitle
                        gradientLeft={'text'}
                        gradientRight={'text'}
                        style={{
                            fontWeight: '700',
                            textAlign: 'left',
                        }}
                    >
                        Legs and Core
                    </ContainerTitle>
                    <HorizontalSpacer gap={9}/>
                    <MoreInfo/>
                    <VerticalSpacer gap={40}/>
                    <ContainerDescription>
                        Leg Extension, Squat (Barbell), Calf Raise on Leg Press
                    </ContainerDescription>
                    <VerticalSpacer gap={10}/>
                    <ContainerDescription>
                        <IconSymbol color={color} name="clock.fill" size={13}/>
                        <HorizontalSpacer gap={5}/>
                        2 days ago
                    </ContainerDescription>
                    <VerticalSpacer gap={10}/>
                </PrimaryContainer>

                <PrimaryContainer
                    mainColor={'info'}
                    style={{ 
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        padding: 10,
                        paddingLeft: 15,
                    }}
                >
                    <ContainerTitle
                        gradientLeft={'text'}
                        gradientRight={'text'}
                        style={{
                            fontWeight: '700',
                            textAlign: 'left',
                        }}
                    >
                        Legs and Core
                    </ContainerTitle>
                    <HorizontalSpacer gap={9}/>
                    <MoreInfo/>
                    <VerticalSpacer gap={40}/>
                    <ContainerDescription>
                        Leg Extension, Squat (Barbell), Calf Raise on Leg Press
                    </ContainerDescription>
                    <VerticalSpacer gap={10}/>
                    <ContainerDescription>
                        <IconSymbol color={color} name="clock.fill" size={13}/>
                        <HorizontalSpacer gap={5}/>
                        2 days ago
                    </ContainerDescription>
                    <VerticalSpacer gap={10}/>
                </PrimaryContainer>
            </View>
        </Animated.ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',

        gap: 10,

        marginLeft: 10,
        marginRight: 10,
    },
});