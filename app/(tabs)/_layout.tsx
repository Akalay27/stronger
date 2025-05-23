import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: {
                        // Use a transparent background on iOS to show the blur effect
                        position: "absolute",
                    },
                    default: {},
                }),
            }}
        >
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="person" color={color} />,
                }}
            />
            <Tabs.Screen
                name="journal"
                options={{
                    title: "Journal",
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="book" color={color} />,
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: "Start",
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus" color={color} />,
                }}
            />
            <Tabs.Screen
                name="workouts"
                options={{
                    title: "Workouts",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="dumbbell.fill" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
                }}
            />
        </Tabs>
    );
}
