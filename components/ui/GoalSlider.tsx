import { PropsWithChildren } from "react";
import { type TextProps } from "react-native";

import { ContainerTitle } from "@/components/ContainerTitle";
import { PrimaryContainer } from "@/components/PrimaryContainer";
import { ProgressSlider } from "@/components/ProgressSlider";
import { VerticalSpacer } from "@/components/VerticalSpacer";

import { Colors } from "@/constants/Colors";

export type GoalSliderProps = TextProps & {
    leftValue: number;
    progress: number;
    rightValue: number;
    titleText: string;
    units: string;
};

export function GoalSlider({
    leftValue,
    onPress,
    progress,
    rightValue,
    style,
    titleText,
    units,
}: GoalSliderProps & PropsWithChildren) {
    const pickContainerColor = (): (keyof typeof Colors.light | keyof typeof Colors.dark) => {
        if(progress < 0.3)
            return "error";

        if(progress > 0.7)
            return "okay";

        return "warning";
    }

    return (
        <PrimaryContainer
            mainColor={pickContainerColor()}
            style={{
                justifyContent: 'center',
            }}
        >
            <ContainerTitle
                style={{
                    fontWeight: '600',
                }}
                widthOverride="100%"
            >{titleText}</ContainerTitle>
            <VerticalSpacer gap={40}/>
            <ProgressSlider
                leftValue={leftValue}
                progress={progress}
                rightValue={rightValue}
                units={units}
            />
            <VerticalSpacer gap={20}/>
        </PrimaryContainer>
    );
};