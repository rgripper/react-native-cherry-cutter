import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Playground = ({ children }) => {
  return <View style={styles.playground}>{children}</View>;
};

const styles = StyleSheet.create({
  playground: {
    flex: 1,
  },
});

export default Playground;
