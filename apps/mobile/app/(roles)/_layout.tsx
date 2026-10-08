import { Stack } from "expo-router";

export default function RolesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f8fafc" },
      }}
    >
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}

