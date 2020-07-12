import React, {Component} from 'react';
import {createAppContainer, createStackNavigator} from 'react-navigation';
import Splash from './src/screens/Splash';
import Profile from './src/screens/Profile';
import ShoppingList from './src/screens/ShoppingList';
import SignUpModal from './src/screens/SignUpModal';
import Tutorial from './src/screens/Tutorial';
import Currency from './src/screens/Currency';
import History from './src/screens/History';
import Main from './src/screens/Main';

const AppNavigator = createStackNavigator(
  {
    Splash: {screen: Splash},
    Currency: {screen: Currency},
    Tutorial: {screen: Tutorial},
    Main: {screen: Main},
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
    <AppContainer
      onNavigationStateChange={(prevState, newState, action) => {
        {
          /* if (action.type === "Navigation/BACK" && newState.index === 0)
			BackHandler.exitApp() */
        }
      }}
    />
  );
};
