/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import firebase from 'firebase';

const config = {
    apiKey: "AIzaSyAw590ufMx5wB1TqkoS2x0UrCrbDQeoQrU",
    authDomain: "operationmt-291b5.firebaseapp.com",
    databaseURL: "https://operationmt-291b5.firebaseio.com",
    projectId: "operationmt-291b5",
    storageBucket: "",
    messagingSenderId: "271692207870",
    appId: "1:271692207870:web:0a29e2a542b75cdd"
};

if (firebase.apps.length === 0) {
    firebase.initializeApp(config);
}

AppRegistry.registerComponent(appName, () => App);
