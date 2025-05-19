import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function InspireScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inspire</Text>
      <Text style={styles.subtitle}>Find motivation and ideas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A3EA1',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
});
