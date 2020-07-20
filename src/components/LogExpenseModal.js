import React, {useState} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Keyboard,
  Text,
  TouchableOpacity,
} from 'react-native';

import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LocalizedText from '../components/LocalizedText';
import {getColor, getIcon} from '../data/categories';
import {translate} from '../localization';
import {palette} from '../theme';

let LogExpenseModal = props => {
  const {category, onExpenseLoggedHandler, visible, onModalCLosed} = props;

  const [amount, setAmount] = useState(null);

  return (
    <Modal
      style={styles.mainContainer}
      onClosed={() => {
        onModalCLosed();
        setAmount(null);
      }}
      position={'center'}
      isOpen={visible}>
      <View
        style={[styles.iconContainer, {backgroundColor: getColor(category)}]}>
        <Icon size={70} color={'white'} name={getIcon(category)} />
      </View>
      <View style={styles.contentContainer}>
        <LocalizedText
          localizationKey={'main_add_expense_title'}
          style={styles.title}
        />
        <LocalizedText
          localizationKey={'main_add_expense_content'}
          style={styles.message}
        />
        <View style={styles.inputContainer}>
          <TextInput
            onSubmitEditing={Keyboard.dismiss}
            placeholder={translate('main_add_expense_hint')}
            value={amount}
            onChangeText={text => setAmount(text)}
            keyboardType={'numeric'}
            style={[styles.textInput, {borderColor: getColor(category)}]}
          />
          <Text> {this.currency} </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            onExpenseLoggedHandler(amount);
            onModalCLosed();
            setAmount(null);
          }}
          style={styles.button}
          color={getColor(category)}>
          <LocalizedText
            localizationKey={'main_add_expense_button'}
            style={[styles.buttonText, {color: getColor(category)}]}
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  title: {fontSize: 20},
  message: {fontSize: 15},
  mainContainer: {
    height: 190,
    width: 350,
    borderRadius: 10,
    flexDirection: 'row',
  },
  iconContainer: {
    height: 190,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  contentContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  inputContainer: {alignItems: 'center', flexDirection: 'row'},
  textInput: {
    flex: 1,
    marginVertical: 0,
    borderBottomWidth: 2,
    height: 50,
    paddingLeft: 10,
  },
  button: {
    color: palette.basic.white,
    padding: 10,
  },
  buttonText: {
    fontSize: 15,
    marginTop: 5,
  },
});

export default LogExpenseModal;
