import React, {Component} from 'react';
import {View, Animated, PanResponder} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {panelOffset} from '../data/consts';

class Draggable extends Component {
  constructor(props, context) {
    super(props, context);
    this.dragDelta = new Animated.Value(0);
  }

  componentWillMount() {
    this._val = 0;
    this.dragDelta.addListener(value => {
      this._val = value.value;
    });

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderGrant: (e, gestureState) => {
        this.dragDelta.setOffset(this._val);
        this.dragDelta.setValue(0);
      },
      onPanResponderMove: Animated.event([null, {dy: this.dragDelta}]),
    });
  }

  render() {
    const {style} = this.props;
    this.clampedValue = Animated.diffClamp(this.dragDelta, panelOffset, 0);

    return (
      <Animated.View
        {...this.panResponder.panHandlers}
        style={[style, {transform: [{translateY: this.clampedValue}]}]}>
        <View
          style={{
            marginVertical: 5,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon size={20} name={'grip-lines'} color={'grey'} />
        </View>
        {this.props.children}
      </Animated.View>
    );
  }
}

export default Draggable;
