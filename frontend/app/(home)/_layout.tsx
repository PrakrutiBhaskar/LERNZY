import React from 'react';
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="subject/[id]" />
      <Stack.Screen name="lesson/[topicId]" />
      <Stack.Screen name="quiz/[topicId]" />
      <Stack.Screen name="flashcards/[topicId]" />
      <Stack.Screen name="coding-sandbox" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="auth" />
    </Stack>
  );
}
