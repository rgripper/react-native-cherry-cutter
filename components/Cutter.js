import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Cutter({ left, width }) {
  return (
    <View style={styles.cutter}>
      <View style={[styles.knife, { left: `${left}%`, width: `${width}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  cutter: {
    marginTop: 15,
    marginBottom: 30,
  },
  knife: {
    height: 4,
    backgroundColor: 'yellow',
  },
  whiteText: {
    color: '#fff',
  },
});
