import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";

import { ContainerText } from "@/components/ContainerText";
import { PrimaryContainer } from "@/components/PrimaryContainer";
import { Spacer } from "@/components/Spacer";
import { Title } from "@/components/Title";
import { Button } from "@rneui/themed";

export default function TabTwoScreen() {
  const insets = useSafeAreaInsets();

  return (
    <Animated.ScrollView style={{ paddingTop: insets.top + 40 }}>
      <Title type="h1">Start a Workout</Title>
      <Spacer gap={20} />
      <Title type="h2" lightColor="#888888">
        Get started
      </Title>
      <Spacer gap={20} />
      {/* Container for two buttons side by side */}
      <PrimaryContainer style={{ flexDirection: "row", gap: 10 }}>
        <Button
          title="Create Workout"
          onPress={() => console.log("Create Workout Pressed")}
          containerStyle={{ flex: 1 }}
        />
        <Button
          title="Join Workout"
          onPress={() => console.log("Join Workout Pressed")}
          containerStyle={{ flex: 1 }}
        />
      </PrimaryContainer>
    </Animated.ScrollView>
  );
}
