import { View, type TextProps } from "react-native";

export type HorizontalSpacerProps = TextProps & {
    gap?: number;
};

export function HorizontalSpacer({ gap = 0 }: HorizontalSpacerProps) {
    return <View style={{ height: 1, width: gap }} />;
}
