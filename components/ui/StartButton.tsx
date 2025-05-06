import { PropsWithChildren } from "react";
import { type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

import { Break } from "@/components/Break";
import { ContainerTitle } from "@/components/ContainerTitle";
import { PrimaryContainer } from "@/components/PrimaryContainer";
import { VerticalSpacer } from "@/components/VerticalSpacer";

import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";

export type StartButtonProps = TextProps & {
    titleText?: string;
    icon?: IconSymbolName;
};

export function StartButton({
    titleText = "Start",
    icon = "arrow.right",
    onPress,
    style,
}: StartButtonProps & PropsWithChildren) {
    const color = useThemeColor({ light: "", dark: "" }, "secondaryText");

    return (
        <PrimaryContainer
            mainColor={"primary"}
            onPress={onPress}
            style={{
                flex: 1,
                justifyContent: "center",
            }}
        >
            <ContainerTitle gradientLeft={"#23BECF"} gradientRight={"#3535E2"}>
                {titleText}
            </ContainerTitle>
            <VerticalSpacer gap={40} />
            <Break />
            <IconSymbol color={color} name={icon} size={40} />
        </PrimaryContainer>
    );
}
