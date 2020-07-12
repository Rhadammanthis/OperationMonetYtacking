import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {Transition} from 'react-navigation-fluid-transitions';
import {getColor, getIcon} from '../data/categories';
import {applyMoneyMask} from '../data/consts';
import DoubleTap from './DoubleTapView';

const DOUBLE_PRESS_DELAY = 400;

class ExpensesItem extends Component {
  constructor(props) {
    super(props);
    this._animated = new Animated.Value(0);
    this.lastPress = 0;
  }

  componentDidMount() {
    Animated.timing(this._animated, {
      toValue: 1,
      duration: (this.props.index + 1) * 50,
      clamp: 1000,
    }).start();
  }

  onPress = () => {
    const time = new Date().getTime();
    const delta = time - this.lastPress;
    const {item, history, onUpdated, currency, navigation} = this.props;

    if (delta < DOUBLE_PRESS_DELAY) {
      // Success double press
      const {navigate} = navigation;
      navigate('History', {
        cat: item.key,
        history: history,
        amount: item.amount,
        onUpdated: onUpdated,
        currency: currency,
      });
    } else {
      //Single press
      this.props.onPress();
    }
    this.lastPress = time;
  };

  render() {
    const {item, history, onUpdated, currency, navigation} = this.props;

    const rowStyles = [
      styles.tile,
      {backgroundColor: getColor(item.key)},
      {opacity: this._animated},
      {
        transform: [
          {scale: this._animated},
          {
            rotate: this._animated.interpolate({
              inputRange: [0, 1],
              outputRange: ['35deg', '0deg'],
              extrapolate: 'clamp',
            }),
          },
        ],
      },
    ];
    return (
      <DoubleTap
        singleTap={() => {
          this.props.onPress();
        }}
        doubleTap={() => {
          const {navigate} = navigation;
          navigate('History', {
            cat: item.key,
            history: history,
            amount: item.amount,
            onUpdated: onUpdated,
            currency: currency,
          });
        }}
        delay={200}>
        <Animated.View style={rowStyles}>
          <Transition shared={getIcon(item.key)}>
            <View style={[styles.icon, {backgroundColor: getColor(item.key)}]}>
              <Icon size={28} color={'white'} name={getIcon(item.key)} />
            </View>
          </Transition>
          <Text style={{fontSize: 16, marginTop: 5, color: 'white'}}>
            {applyMoneyMask(item.amount)} {currency}
          </Text>
        </Animated.View>
      </DoubleTap>
    );
  }
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 5,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ExpensesItem.propTypes = {
//     item: PropTypes.object.isRequired,
//     index: PropTypes.number.isRequired,
//     onPress: PropTypes.func.isRequired,
//     navigation: PropTypes.object.isRequired,
//     currency: PropTypes.string.isRequired,
//     history: PropTypes.array.isRequired,
//     onUpdated: PropTypes.func.isRequired
// }

export default ExpensesItem;
