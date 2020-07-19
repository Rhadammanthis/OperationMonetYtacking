import React, {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';

import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/FontAwesome5';

import {palette} from '../theme';
import {HEIGHT, WIDTH} from '../data/consts';

let ToolTipMenu = props => {
  const {modalStateHandler, navigation} = props;

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    modalStateHandler(modalVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalVisible]);

  return (
    <>
      <ActionButton
        onPress={() => {
          setModalVisible(true);
          modalStateHandler(modalVisible);
        }}
        renderIcon={() => {
          return <Icon color={'white'} size={15} name="chart-line" />;
        }}
        offsetY={15}
        offsetX={120}
        spacing={15}
        verticalOrientation="down"
        position="right"
        fixNativeFeedbackRadius={true}
        backdrop={
          <View style={[styles.backDrop, {height: HEIGHT, width: WIDTH}]} />
        }
        size={40}
        buttonColor={palette.spendless.lightBlue}
      />
      <ActionButton
        onPress={() => {
          console.log('CODE', this.code);
          navigation.navigate('ShoppingList', {
            shopping: this.shopping,
            code: this.code,
          });
        }}
        renderIcon={active => {
          return <Icon color={'white'} size={15} name="tasks" />;
        }}
        offsetY={15}
        offsetX={70}
        spacing={15}
        verticalOrientation="down"
        position="right"
        fixNativeFeedbackRadius={true}
        size={40}
        buttonColor={palette.spendless.lightBlue}
      />
      <ActionButton
        onPress={() => {
          console.log('CODE', this.code);
          navigation.navigate('Profile', {code: this.code});
        }}
        renderIcon={() => {
          return <Icon color={'white'} size={15} name="user" />;
        }}
        offsetY={15}
        offsetX={20}
        verticalOrientation="down"
        position="right"
        spacing={15}
        fixNativeFeedbackRadius={true}
        size={40}
        buttonColor={palette.spendless.lightBlue}
      />
    </>
  );
};

const styles = StyleSheet.create({
  backDrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: palette.basic.black,
    opacity: 1,
  },
});

export default ToolTipMenu;
