import * as React from 'react';
import { Animated, Image, StyleSheet } from 'react-native';

class FallingItem extends React.Component {
  state = {
    topAnim: new Animated.Value(0), // Initial value for opacity: 0
    isScattered: false,
  };

  destroyTimeout = null;

  selfDestroy = () => {
    this.destroyTimeout = setTimeout(
      () =>
        this.setState({
          isScattered: true,
        }),
      5200
    );
  };

  componentDidMount() {
    Animated.timing(
      // Animate over time
      this.state.topAnim, // The animated value to drive
      {
        toValue: 1,
        duration: 5000, // Make it take a while
      }
    ).start(); // Starts the animation

    this.selfDestroy();
  }

  componentWillUnmount() {
    clearTimeout(this.destroyTimeout);
  }

  render() {
    const { topAnim, isScattered } = this.state;
    const { left, width, isCut } = this.props;

    return !isScattered ? (
      <Animated.View // Special animatable View
        style={{
          position: 'absolute',
          width: `${width}%`,
          height: '5%',
          top: topAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }), // Bind top to animated value
          left: `${left}%`,
        }}>
        <Image style={styles.cherry} source={require('../assets/cherry.png')} />
        <Image
          style={[
            styles.cherry,
            styles.splash,
            { opacity: isCut ? 1 : 0 },
          ]}
          source={require('../assets/splash.png')}
        />
      </Animated.View>
    ) : null;
  }
}

export default React.memo(FallingItem);

const styles = StyleSheet.create({
  cherry: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  splash: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: [{scale: 3}],
  },
});
