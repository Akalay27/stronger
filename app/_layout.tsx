import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRootNavigationState, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { supabase } from "@/lib/supabase";
import { initDatabase, syncUnsyncedWorkouts } from "@/lib/database";
import { Session } from "@supabase/supabase-js";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const navState = useRootNavigationState();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [session, setSession] = useState<Session | null>(null);

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
    if (!navState?.key || !loaded || session === undefined) return;

    if (session === null) {
      router.replace("/login");
    } else {
      // Try to sync any unsynced workout sets when user is authenticated
      syncUnsyncedWorkouts()
        .then(() => console.log("Unsynced workouts synced"))
        .catch((error) =>
          console.error("Error syncing unsynced workouts:", error)
        );
      router.replace("/(tabs)");
    }
  }, [navState?.key, loaded, session]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login/index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
