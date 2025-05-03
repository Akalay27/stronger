import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type TitleProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: 'h1' | 'h2' | 'h3';
};

export function Title({ style, lightColor, darkColor, type = 'h1', ...rest }: TitleProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

    return (
        <Text
            style={[
                { color },
                styles.border,
                type === 'h1' ? styles.h1 : undefined,
                type === 'h2' ? styles.h2 : undefined,
                type === 'h3' ? styles.h3 : undefined,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    border: {
        borderBottomColor: '#dddddd',
        borderBottomWidth: 1,
    },
    h1: {
        fontSize: 34,
        fontWeight: '800',

        paddingBottom: 10,
        paddingLeft: 15,
    },
    h2: {
        fontSize: 17,
        fontWeight: '600',

        marginLeft: 'auto',
        marginRight: 'auto',

        paddingBottom: 2,
        paddingLeft: 5,

        width: '98%',
    },
    h3: {
        fontSize: 12,
    },
});
