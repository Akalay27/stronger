import { View, type TextProps } from 'react-native';

export type VerticalSpacerProps = TextProps & {
    gap?: number;
};

export function VerticalSpacer({
    gap = 0
}: VerticalSpacerProps) {
    return (
        <View style={{ height: gap, width: 1 }}/>
    );
}