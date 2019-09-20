import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import Playground from './components/Playground';
import Cutter from './components/Cutter';
import FallingItem from './components/FallingItem';
import { Accelerometer } from 'expo-sensors';
import { createGame } from './game-engine';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#110', 
  },
  score: {
    color: '#fff',
  },
});

function convertAccelerometerDataToDirection(data) {
  return data.x > 0 ? 'left' : data.x < 0 ? 'right' : null;
}

export default function App () {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const game = createGame({
      onChange: setGameState,
      cutter: {
        left: 10,
        width: 20,
        top: 95,
        height: 5
      },
      generator: {
        maxItems: 10,
        interval: 1000
      }
    });

    Accelerometer.setUpdateInterval(50);
    const subscription = Accelerometer.addListener(data => {
      const direction = convertAccelerometerDataToDirection(data);
      game.setDirection(direction);
    });

    return () => {
      game.stop();
      subscription.remove();
    }
  }, []);

  return (
    <View style={styles.container}>
      {gameState && (
      <>
          <Playground>
            {gameState.items.map(item => (
              <FallingItem
                key={item.id}
                left={item.left}
                width={item.width}
                isCut={item.isCut}
              />
            ))}
          </Playground>
    
          <Cutter left={gameState.cutter.left} width={gameState.cutter.width} />
          <View>
            <Text style={styles.score}>direction: {gameState.direction}</Text>
            <Text style={styles.score}>cutter left: {gameState.cutter.left}</Text>
            <Text style={styles.score}>Score: {gameState.items.filter(x => x.isCut).length}</Text>
            <Text style={styles.score}>{gameState.isFinished ? 'Finished' : 'Running'}</Text>
          </View>
      </>
      )}

    </View>
  );
}
