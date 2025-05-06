import { PropsWithChildren } from "react";
import { type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

import { Break } from "@/components/Break";
import { ContainerTitle } from "@/components/ContainerTitle";
import { PrimaryContainer } from "@/components/PrimaryContainer";
import { VerticalSpacer } from "@/components/VerticalSpacer";

import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";

export type GenerateButtonProps = TextProps & {
    titleText?: string;
    icon?: IconSymbolName;
};

export function GenerateButton({
    titleText = "Generate",
    icon = "sparkles",
    onPress,
    style,
}: GenerateButtonProps & PropsWithChildren) {
    const color = useThemeColor({ light: "", dark: "" }, "secondaryText");

    return (
        <PrimaryContainer
            mainColor={'secondary'}
            onPress={onPress}
            style={{
                flex: 1,
                justifyContent: 'center',
            }}
        >
            <ContainerTitle
                gradientLeft={'#9B5DFF'}
                gradientRight={'#EA00B0'}
            >{titleText}</ContainerTitle>
            <VerticalSpacer gap={40}/>
            <Break/>
            <IconSymbol
                color={color}
                name={icon}
                size={40}
            />
        </PrimaryContainer>
    );
};