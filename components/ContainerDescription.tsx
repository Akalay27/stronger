import { PropsWithChildren } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ContainerDescriptionProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
};

export function ContainerDescription({
    style,
    lightColor,
    darkColor,
    children
}: ContainerDescriptionProps & PropsWithChildren) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'tertiaryText');

    return (
        <Text style={[
            {
                color: color,
            },
            styles.text
        ]}>{children}</Text>
    );
}

const styles = StyleSheet.create({
    text: {
        fontSize: 13,
        fontWeight: '500',

        lineHeight: 20,

        textAlign: 'left',

        width: '100%',
    },
});