import { PropsWithChildren } from 'react';
import { StyleSheet, Text, type TextProps, TouchableOpacity, ViewStyle } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export type MoreInfoButtonProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    mainColor?: keyof typeof Colors.light | keyof typeof Colors.dark;
    padding?: number;
};

export function MoreInfoButton({
    darkColor,
    lightColor,
    mainColor = 'primary',
    onPress,
    style,
}: MoreInfoButtonProps & PropsWithChildren) {
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

        includeFontPadding: false,

        marginLeft: 'auto',

        overflow: 'visible',
    },
    text: {
        fontSize: 20,
        fontWeight: '800',

        includeFontPadding: false,

        lineHeight: 15,

        overflow: 'visible',

        textAlign: 'right',
    },
});