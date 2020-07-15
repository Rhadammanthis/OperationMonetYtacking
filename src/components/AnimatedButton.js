import React, {useEffect, useRef} from 'react';
import {Animated, TouchableOpacity, StyleSheet} from 'react-native';

import {SPENDLESS_LIGHT_BLUE} from '../data/consts';
import LocalizedText from './LocalizedText';

let AnimatedButton = props => {
  const {localizationKey, textStyle, onPress, show = false} = props;

  const animCloseButton = useRef(new Animated.Value(0));

  const springAnimation = Animated.spring(animCloseButton.current, {
    toValue: 1,
    duration: 200,
    friction: 8,
    tension: 50,
    useNativeDriver: true,
  });

  useEffect(() => {
    if (show) springAnimation.start();
  }, [show, springAnimation]);

  return (
    <TouchableOpacity onPress={onPress}>
      <Animated.View
        style={[
          styles.button,
          {
            transform: [
              {
                translateY: animCloseButton.current.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 20],
                }),
              },
            ],
          },
        ]}>
        <LocalizedText localizationKey={localizationKey} style={textStyle} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SPENDLESS_LIGHT_BLUE,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});

export default AnimatedButton;
