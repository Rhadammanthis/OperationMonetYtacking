import React from 'react';
import {View, StyleSheet} from 'react-native';

import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {getColor, getName, getIcon, Categories} from '../data/categories';
import {HEIGHT, WIDTH} from '../data/consts';
import {palette} from '../theme';

let DropUpActionButton = props => {
  const {categoryButtonPressed, show} = props;

  const buttonItems = Object.keys(Categories).map((cat, index) => {
    return (
      <ActionButton.Item
        key={index}
        textStyle={{color: palette.basic.white}}
        textContainerStyle={[
          styles.actionButton,
          {
            backgroundColor: getColor(Categories[cat]),
            borderColor: getColor(Categories[cat]),
          },
        ]}
        buttonColor={getColor(Categories[cat])}
        title={getName(Categories[cat])}
        onPress={() => categoryButtonPressed(Categories[cat])}>
        <Icon size={20} name={getIcon(Categories[cat])} color={'white'} />
      </ActionButton.Item>
    );
  });

  return show ? (
    <ActionButton
      offsetX={10}
      offsetY={10}
      spacing={15}
      fixNativeFeedbackRadius={true}
      position="right"
      backdrop={
        <View style={[styles.backdrop, {height: HEIGHT, width: WIDTH}]} />
      }
      size={45}
      buttonColor="rgba(0, 173, 245, 1)">
      {buttonItems}
    </ActionButton>
  ) : null;
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: palette.basic.black,
    opacity: 0.7,
  },
  actionButton: {
    borderRadius: 5,
  },
});

export default DropUpActionButton;
