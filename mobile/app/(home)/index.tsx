import React from 'react';
import { View, Text } from 'react-native';

export default function HomeDashboard(): React.JSX.Element {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF8' }}>
      <Text style={{ fontSize: 20, color: '#1C1B18', fontWeight: 'bold' }}>Lernzy Dashboard</Text>
    </View>
  );
}
