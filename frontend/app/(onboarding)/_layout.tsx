import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="language" />
      <Stack.Screen name="name" />
      <Stack.Screen name="grade" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="learning-style" />
      <Stack.Screen name="done" />
    </Stack>
  );
}
