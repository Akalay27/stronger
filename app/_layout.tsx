import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";

import { useColorScheme } from "@/hooks/useColorScheme";
import { supabase } from "@/lib/databases/supabase/setup";

import { initDatabase } from "@/lib/databases/sqlite/setup";
import { syncUnsyncedWorkouts } from "@/lib/databases/misc";

import { Session } from "@supabase/supabase-js";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const router = useRouter();

    const [session, setSession] = useState<Session | null>(null);

    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    useEffect(() => {
        // Initialize database
        initDatabase()
            .then(() => console.log("Database initialized"))
            .catch((error) => console.error("Error initializing database:", error));

        // Get session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    // 🔁 Redirect after session state changes
    useEffect(() => {
        if (!loaded || session === undefined) return;

        if (session === null) {
            router.replace("/login");
        } else {
            // Try to sync any unsynced workout sets when user is authenticated
            syncUnsyncedWorkouts()
                .then(() => console.log("Unsynced workouts synced"))
                .catch((error) => console.error("Error syncing unsynced workouts:", error));
            router.replace("/(tabs)");
        }
    }, [loaded, session]);

    if (!loaded) return null;

    return (
        <GestureHandlerRootView>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                    <Stack.Screen name="login/index" options={{ headerShown: false }} />
                    <Stack.Screen
                        name="active/index"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="active/add-exercise"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="active/finish-workout"
                        options={{
                            headerShown: false,
                            headerTitle: "Finish Options",
                            headerBackVisible: false,
                        }}
                    />
                </Stack>

                <StatusBar style="auto" />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}