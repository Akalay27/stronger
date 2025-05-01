import { PropsWithChildren } from 'react';
import { StyleSheet, Text, type TextProps, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

import { useThemeColor } from '@/hooks/useThemeColor';

export type TitleProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    gradientLeft?: string | null;
    gradientRight?: string | null;
};

export function ContainerText({
    style,
    lightColor,
    darkColor,
    gradientLeft = null,
    gradientRight = null,
    children
}: TitleProps & PropsWithChildren) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    const gradLeft = gradientLeft ? gradientLeft : color;
    const gradRight = gradientRight ? gradientRight : color;

    return (
        <MaskedView
            maskElement={
                <Text
                    style={[
                        styles.text,
                        style
                    ]}
                >{children}</Text>
            }
            
        >
            <LinearGradient
                colors={[gradLeft, gradRight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 30 }}
            />
            <Text style={[styles.maskedViewText]}>{children}</Text>
        </MaskedView>
  );
}

const styles = StyleSheet.create({
    maskedViewText: {
        color: 'transparent',
        fontSize: 25,
    },
    text: {
        backgroundColor: 'transparent',
        color: '#000',
        fontSize: 23,
        fontWeight: '800',
        textAlign: 'center',
    },
});