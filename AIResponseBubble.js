
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function AIResponseBubble({ text }) {
  // Split by lines
  const lines = text.split('\n').filter(line => line.trim() !== '');

  // Format bold (**text**) dynamically
  const formatBold = (line, idx) =>
    line.split(/\*\*(.*?)\*\*/g).map((chunk, i) =>
      i % 2 === 1 ? (
        <Text key={i} style={styles.bold}>
          {chunk}
        </Text>
      ) : (
        <Text key={i}>{chunk}</Text>
      )
    );

  return (
    <View style={styles.container}>
      {lines.map((line, idx) => (
        <Text key={idx} style={styles.text}>
          {formatBold(line, idx)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f0fa',
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
    color: '#4a148c',
  },
});
