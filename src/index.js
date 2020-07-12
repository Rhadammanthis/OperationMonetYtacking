import React, {Component} from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import {createAppContainer, createStackNavigator} from 'react-navigation';

import Splash from './screens/Splash';
import Profile from './screens/Profile';
import ShoppingList from './screens/ShoppingList';
import SignUpModal from './screens/SignUpModal';
import Tutorial from './screens/Tutorial';
import Currency from './screens/Currency';
import History from './screens/History';
import Main from './screens/Main';

import {SPENDLESS_BLUE} from './data/consts';

const AppNavigator = createStackNavigator(
  {
    Splash: {screen: Splash},
    Currency: {screen: Currency},
    Tutorial: {screen: Tutorial},
    Main: {
      screen: Main,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    ShoppingList: {screen: ShoppingList},
    Profile: {screen: Profile},
  },
  {
    initialRouteName: 'Splash',
    headerMode: 'none',
  },
);

const RootStack = createStackNavigator(
  {
    AppNavigator: {
      screen: AppNavigator,
    },
    SignUpModal: {
      screen: SignUpModal,
    },
    History: {screen: History},
  },
  {
    mode: 'modal',
    headerMode: 'none',
  },
);

let AppContainer = createAppContainer(RootStack);

export default () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: SPENDLESS_BLUE}}>
      <StatusBar barStyle="light-content" translucent={true} />
      <AppContainer />
    </SafeAreaView>
  );
};
