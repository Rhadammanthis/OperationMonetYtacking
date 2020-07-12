/**
 * @format
 */

import {AppRegistry, UIManager} from 'react-native';
import firebase from 'firebase';
import App from './src';
import {name as appName} from './app.json';

const config = {
  apiKey: 'AIzaSyAw590ufMx5wB1TqkoS2x0UrCrbDQeoQrU',
  authDomain: 'operationmt-291b5.firebaseapp.com',
  databaseURL: 'https://operationmt-291b5.firebaseio.com',
  projectId: 'operationmt-291b5',
  storageBucket: '',
  messagingSenderId: '271692207870',
  appId: '1:271692207870:web:0a29e2a542b75cdd',
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(config);
}

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

AppRegistry.registerComponent(appName, () => App);
