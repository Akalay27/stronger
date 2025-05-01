import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import { ContainerText } from '@/components/ContainerText';
import { PrimaryContainer } from '@/components/PrimaryContainer';
import { Spacer } from '@/components/Spacer';
import { Title } from '@/components/Title';

export default function TabTwoScreen() {
    const insets = useSafeAreaInsets();

    return (
        <Animated.ScrollView style={{ paddingTop: insets.top + 90 }}>
            <Title type='h1'>h1</Title>
            <Spacer gap={20}/>
            <Title type='h2' lightColor='#888888'>h2</Title>
            <Spacer gap={20}/>
            <PrimaryContainer
                mainColor={'primary'}
                style={{ width: '50%' }}
            >
                <ContainerText
                    gradientLeft={'#23BECF'}
                    gradientRight={'#3535E2'}
                >Start</ContainerText>
            </PrimaryContainer>
        </Animated.ScrollView>
    );
}