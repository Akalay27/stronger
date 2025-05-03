import { View, type TextProps } from 'react-native';

export type SpacerProps = TextProps & {
    gap?: number;
};

export function Spacer({ gap = 0 }: SpacerProps) {
    return <View style={{ marginBottom: gap }} />;
}
