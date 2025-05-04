import { PropsWithChildren, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, type TextProps, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ContainerTitleProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    gradientLeft?: string | keyof typeof Colors.light | keyof typeof Colors.dark;
    gradientRight?: string | keyof typeof Colors.light | keyof typeof Colors.dark;
};

export function ContainerTitle({
    style,
    lightColor,
    darkColor,
    gradientLeft = 'text',
    gradientRight = 'text',
    children
}: ContainerTitleProps & PropsWithChildren) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    const [textSize, setTextSize] = useState({ width: 0, height: 0 });

    const onTextLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;

        setTextSize({ width, height });
    }

    const gradLeft = () => {
        let finalGradient = gradientLeft;

        if(gradientLeft in Colors.light) {
            finalGradient = Colors.light[gradientLeft as keyof typeof Colors.light];
        } else if(gradientLeft in Colors.dark) {
            finalGradient = Colors.dark[gradientLeft as keyof typeof Colors.dark];
        }

        return finalGradient;
    }

    const gradRight = () => {
        let finalGradient = gradientRight;

        if(gradientRight in Colors.light) {
            finalGradient = Colors.light[gradientRight as keyof typeof Colors.light];
        } else if(gradientRight in Colors.dark) {
            finalGradient = Colors.dark[gradientRight as keyof typeof Colors.dark];
        }

        return finalGradient;
    }

    if (textSize.width === 0 || textSize.height === 0) {
        // Render hidden text to measure
        return (
        <Text
            onLayout={onTextLayout}
            style={[
                {
                    position: 'absolute',
                    opacity: 0, // invisible but still renders
                },
                styles.text,
            ]}
        >
            {children}
        </Text>
        );
    }

    return (
        <MaskedView
            maskElement={
                <View style={{
                    height: textSize.height,

                    width: textSize.width,
                }}>
                    <Text
                        style={[
                            styles.text,
                            style,
                        ]}
                    >{children}</Text>
                </View>
            }
        >
            <LinearGradient
                colors={[gradLeft(), gradRight()]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                    width: textSize.width,
                    height: textSize.height,
                }}
            />
        </MaskedView>
  );
}

const styles = StyleSheet.create({
    maskedView: {
        alignItems: 'center',
        flex: 1,
    },
    text: {
        backgroundColor: 'transparent',

        color: '#000',

        fontSize: 20,
        fontWeight: '800',

        textAlign: 'center',
    },
});