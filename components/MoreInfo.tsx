import { PropsWithChildren } from 'react';
import { StyleSheet, Text, type TextProps, TouchableOpacity, ViewStyle } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export type MoreInfoProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    mainColor?: keyof typeof Colors.light | keyof typeof Colors.dark;
    padding?: number;
};

export function MoreInfo({
    darkColor,
    lightColor,
    mainColor = 'primary',
    onPress,
    style,
}: MoreInfoProps & PropsWithChildren) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'tertiaryText');

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.container,
                style as ViewStyle,
            ]}
        >
        <Text style={[
            { color: color },
            styles.text,
        ]}>...</Text>
        </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

        width: 100,
    },
    text: {
        fontSize: 25,
        fontWeight: '800',

        lineHeight: 23,
    },
});