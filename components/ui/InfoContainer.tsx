import { PropsWithChildren } from "react";
import { GestureResponderEvent, type TextProps, View } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

import { ContainerDescription } from "@/components/ContainerDescription";
import { ContainerTitle } from "@/components/ContainerTitle";
import { HorizontalSpacer } from "@/components/HorizontalSpacer";
import { MoreInfoButton } from "@/components/MoreInfoButton";
import { PrimaryContainer } from "@/components/PrimaryContainer";
import { VerticalSpacer } from "@/components/VerticalSpacer";

import { IconSymbol } from "@/components/ui/IconSymbol";

export type InfoContainerProps = TextProps & {
    descriptionText: string;
    moreInfoOnPress?: ((event: GestureResponderEvent) => void) | undefined;
    timerText?: string | null;
    titleText: string;
};

export function InfoContainer({
    descriptionText,
    onPress,
    moreInfoOnPress,
    style,
    timerText = null,
    titleText,
}: InfoContainerProps & PropsWithChildren) {
    const color = useThemeColor({ light: "", dark: "" }, "secondaryText");

    return (
        <PrimaryContainer
            mainColor={'info'}
            onPress={onPress}
            style={{ 
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: 10,
                paddingLeft: 10,
            }}
        >
            <View style={{
                alignItems: 'flex-start',
                flexDirection: 'row',
            }}>
                <ContainerTitle
                    gradientLeft={'text'}
                    gradientRight={'text'}
                    style={{
                        fontSize: 20,
                        fontWeight: '700',

                        textAlign: 'left',
                    }}
                >{titleText}</ContainerTitle>
                <MoreInfoButton
                    onPress={moreInfoOnPress}
                />
            </View>
            <VerticalSpacer gap={10}/>
            <ContainerDescription>{descriptionText}</ContainerDescription>
            <VerticalSpacer gap={10}/>
            {timerText && 
                <ContainerDescription>
                    <IconSymbol color={color} name="clock.fill" size={13}/>
                    <HorizontalSpacer gap={5}/>
                    {timerText}
                </ContainerDescription>
            }
        </PrimaryContainer>
    );
};