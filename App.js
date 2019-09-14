import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import Playground from './components/Playground';
import Cutter from './components/Cutter';
import FallingItem from './components/FallingItem';
import { Accelerometer } from 'expo-sensors';

const ITEMS_TOTAL = 10; // count of cherries

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

const getCutterShift = ({ cutterLeft, cutterRight, accelerometerData }) => {
  const { x } = accelerometerData;
  if (x === 0) {
    return 0;
  }

  const speed = 1;
  const isLeft = x > 0; // positive `x` means left

  if (isLeft) {
    return -Math.min(speed, cutterLeft);
  }
  else {
    return +Math.min(speed, cutterRight);
  }
}

export default function App () {
  const cutterWidth = 30;
  const [score, setScore] = useState(0);
  const [cutterLeft, setCutterLeft] = useState(0);
  const [lastItemId, setLastItemId] = useState(0);
  const [fallingItems, setFallingItems] = useState([]);
  const [itemGeneratorTimeout, setItemGeneratorTimeout] = useState();
  const [checkDestroyedTimeout, setCheckDestroyedTimeout] = useState();

  const stateRef = useRef({ fallingItems, lastItemId });
  stateRef.current = { fallingItems, lastItemId, cutterLeft, cutterWidth };

  const checkDestroyed = (itemLeft, itemId) => {
    const itemRight = itemLeft + 10; // items are 10% wide
    const cutterRight = stateRef.current.cutterLeft + stateRef.current.cutterWidth; // cutter is 20% wide

    if (cutterLeft < itemRight && cutterRight > itemLeft) {
      setScore(score => score + 1);
      setFallingItems(fallingItems => {
        const item = fallingItems.find(x => x.id === itemId);
        if (item) { // TODO
          item.isDestroyed = true;
        }
        return fallingItems;
      });
    }
  };

  const tryScheduleNextItem = () => {
    const canGenerateNewItem = stateRef.current.fallingItems.length < ITEMS_TOTAL;
    if (canGenerateNewItem) {
      const timeoutId = setTimeout(addItem, 1000);
      setItemGeneratorTimeout(timeoutId);
    }
  }

  const addItem = () => {
    const newItemLeft = Math.floor(Math.random(90) * 90); // items are 10% wide, so max left 90%
    const newItem = {
      left: newItemLeft,
      id: stateRef.current.lastItemId + 1
    };

    setLastItemId(newItem.id);
    setFallingItems([
      ...stateRef.current.fallingItems,
      newItem
    ]);

    const timeoutId = setTimeout(
      () => checkDestroyed(newItemLeft, newItem.id),
      4750 // 5000ms for item to drop to bottom, 4750ms to touch cutter (height considered)
    );

    setCheckDestroyedTimeout(timeoutId);

    tryScheduleNextItem();
  };

  useEffect(() => {
    Accelerometer.setUpdateInterval(16);
    const unsubscribeAccelerometer = Accelerometer.addListener(accelerometerData => {
      const { cutterLeft, cutterWidth } = stateRef.current;

      const shift = getCutterShift({ 
        cutterLeft, 
        cutterRight: 100 - cutterWidth - cutterLeft, 
        accelerometerData 
      });

      setCutterLeft(cutterLeft + shift);
    });

    addItem();
    return () => {
      clearTimeout(itemGeneratorTimeout);
      clearTimeout(checkDestroyedTimeout);
      unsubscribeAccelerometer();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Playground>
        {fallingItems.map(item => (
          <FallingItem
            key={item.id}
            left={item.left}
            isDestroyed={item.isDestroyed}
          />
        ))}
      </Playground>

      <Cutter left={cutterLeft} width={cutterWidth} />
      <View>
        <Text style={styles.score}>Score: {score}</Text>
      </View>
    </View>
  );
}
