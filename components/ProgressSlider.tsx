import { PropsWithChildren, useState } from "react";
import {
    DimensionValue,
    LayoutChangeEvent,
    StyleSheet,
    Text,
    type TextProps,
    View,
} from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ProgressSliderProps = TextProps & {
    darkColor?: string;
    leftValue: number;
    lightColor?: string;
    progress?: number;
    rightValue: number;
    units: string;
};

export function ProgressSlider({
    darkColor,
    leftValue,
    lightColor,
    progress = 0.5,
    rightValue,
    style,
    units,
}: ProgressSliderProps & PropsWithChildren) {
    const labelColor = useThemeColor({ light: lightColor, dark: darkColor }, "tertiaryText");

    const [sliderSize, setSliderSize] = useState({ width: 0, height: 0 });
    const [sliderContainerSize, setSliderContainerSize] = useState({ width: 0, height: 0 });

    const onSliderLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;

        setSliderSize({ width, height });
    };

    const onSliderContainerLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;

        setSliderContainerSize({ width, height });
    };

    const setBottomLabelPosition = (
        containerWidth: number,
        sliderWidth: number,
    ): DimensionValue => {
        const adjustedProgress = progress * 2 - 1;

        const boundingPercentage =
            (1 - (containerWidth - sliderWidth * adjustedProgress) / containerWidth) * 100;
        const progressPercentage = boundingPercentage;

        return (progressPercentage.toString() + "%") as DimensionValue;
    };

    return (
        <View onLayout={onSliderContainerLayout} style={styles.sliderContainer}>
            <Text
                style={[
                    {
                        color: labelColor,
                    },
                    styles.sliderSideLabel,
                ]}
            >
                {leftValue.toString() + units}
            </Text>
            <View onLayout={onSliderLayout} style={styles.sliderBarContainer}>
                <View style={styles.sliderBackground}>
                    <View
                        style={[
                            {
                                width: ((progress * 100).toString() + "%") as DimensionValue,
                            },
                            styles.slider,
                        ]}
                    ></View>
                </View>
            </View>
            <Text
                style={[
                    {
                        color: labelColor,
                    },
                    styles.sliderSideLabel,
                ]}
            >
                {rightValue.toString() + units}
            </Text>
            <View
                style={[
                    {
                        marginLeft: setBottomLabelPosition(
                            sliderContainerSize.width,
                            sliderSize.width,
                        ),
                    },
                    styles.sliderBottomLabel,
                ]}
            >
                <IconSymbol color={labelColor} name="chevron.up" size={20} />
                <Text style={{ color: labelColor }}>
                    {(leftValue + (rightValue - leftValue) * progress).toFixed(1) + units}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    slider: {
        backgroundColor: "#0060FF",
        borderRadius: 5,

        height: 5,
    },
    sliderBackground: {
        backgroundColor: "#EEE",
        borderRadius: 5,

        height: 5,
    },
    sliderBarContainer: {
        flexGrow: 1,

        justifyContent: "center",

        height: 30,

        marginLeft: 10,
        marginRight: 10,
    },
    sliderBottomLabel: {
        alignItems: "center",
        marginTop: 20,
        position: "absolute",
    },
    sliderContainer: {
        flexDirection: "row",

        height: 30,

        justifyContent: "center",

        width: "100%",
    },
    sliderSideLabel: {
        lineHeight: 30,
    },
});
