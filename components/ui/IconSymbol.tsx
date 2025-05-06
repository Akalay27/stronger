// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
    // See MaterialIcons here: https://icons.expo.fyi
    // See SF Symbols in the SF Symbols app on Mac.
    'arrow.right': 'arrow-forward',
    'book': 'book',
    'clock.fill': 'timer',
    'dumbbell.fill': 'fitness-center',
    'gear': 'settings',
    'person.fill': 'person',
    'plus': 'add',
    'sparkles': 'auto-awesome',
    'chevron.up': 'keyboard-arrow-up',
} as Partial<
    Record<
        import('expo-symbols').SymbolViewProps['name'],
        React.ComponentProps<typeof MaterialIcons>['name']
    >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
    name,
    size = 24,
    color,
    style,
}: {
    name: IconSymbolName;
    size?: number;
    color: string | OpaqueColorValue;
    style?: StyleProp<ViewStyle>;
    weight?: SymbolWeight;
}) {
    return (
            <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style as TextStyle} />
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',

        justifyContent: 'center',

        width: '100%',
    }
});