import { PropsWithChildren } from 'react';
import { StyleSheet, type TextProps, TouchableOpacity, ViewStyle } from 'react-native';

import { Colors } from '@/constants/Colors';
import { HexToRGBA } from '@/constants/ConvertColor';
import { useThemeColor } from '@/hooks/useThemeColor';

export type TitleProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    mainColor?: keyof typeof Colors.light | keyof typeof Colors.dark;
};

export function PrimaryContainer({
    style,
    lightColor,
    darkColor,
    mainColor = 'primary',
    children,
}: TitleProps & PropsWithChildren) {
    const borderColor = useThemeColor({ light: lightColor, dark: darkColor }, mainColor);
    const backgroundColor = HexToRGBA(borderColor, 0.1);

    return (
        <TouchableOpacity
            style={[
                {
                    borderColor: borderColor,
                    backgroundColor: backgroundColor,
                },
                styles.container,
                style as ViewStyle,
            ]}
        >
            {children}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        alignSelf: 'flex-start',

        borderRadius: 10,
        borderWidth: 3,

        padding: 20,
    },
});
