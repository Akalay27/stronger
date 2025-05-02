/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#4052D6';
const tintColorDark = '#fff';

export const Colors = {
    light: {
        background: '#fff',
        error: '#FF2C2C',
        icon: '#687076',
        okay: '#34C759',
        primary: '#32ADE6',
        secondary: '#AF52DE',
        tabIconDefault: '#687076',
        tabIconSelected: tintColorLight,
        text: '#000000',
        tint: tintColorLight,
        warning: '#FFDF99',
    },

    dark: {
        background: '#151718',
        error: '#FF2C2C',
        icon: '#9BA1A6',
        okay: '#34C759',
        primary: '#32ADE6',
        secondary: '#AF52DE',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: tintColorDark,
        text: '#ECEDEE',
        tint: tintColorDark,
        warning: '#FFDF99',
    },
};