import React, {Component} from 'react';
import {
  AsyncStorage,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import {StackActions} from 'react-navigation';
import LocalizedText from '../components/LocalizedText';
import AnimatedButton from '../components/AnimatedButton';
import * as Data from '../data/countries';
import {
  WIDTH,
  SPENDLESS_LIGHT_BLUE_ALPHA,
  SPENDLESS_LIGHT_BLUE,
  SPENDLESS_BLUE,
  HEIGHT,
} from '../data/consts';

class Currency extends Component {
  constructor(props) {
    super(props);
    //161943 H&K
    this.state = {
      selectedCountry: {},
      animCloseButton: new Animated.Value(0),
    };
  }

  componentDidMount() {}

  Item = ({country}) => {
    const {selectedCountry} = this.state;

    const springAnimation = Animated.spring(this.state.animCloseButton, {
      toValue: 1,
      duration: 200,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    });

    const selected = {backgroundColor: SPENDLESS_LIGHT_BLUE_ALPHA};

    return (
      <TouchableOpacity
        onPress={ev => {
          this.setState({selectedCountry: country});
          springAnimation.start();
        }}>
        <View
          style={[
            styles.countryContainer,
            country.id === selectedCountry.id ? selected : {},
          ]}>
          <Image style={{width: 40, height: 40}} source={country.image} />
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 15,
            }}>
            <Text style={{color: 'black', fontSize: 16, textAlign: 'center'}}>
              {country.currency_name}
            </Text>
          </View>
          <View
            style={{justifyContent: 'center', flex: 1, alignItems: 'flex-end'}}>
            <Text style={{color: 'black', fontSize: 17, textAlign: 'center'}}>
              {country.symbol}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  _storeData = async country => {
    try {
      await AsyncStorage.setItem('@persistentItem:currency', country.currency);
      return {success: true, value: country};
    } catch (error) {
      // Error saving data
      return {success: false, value: error};
    }
  };

  _renderAcceptButton = () => {
    const {selectedCountry} = this.state;

    let onPressHandler = () => {
      this._storeData(selectedCountry)
        .then(value => {
          console.log(value);
          this.props.navigation.dispatch(StackActions.popToTop());
          return;
        })
        .catch(error => {
          console.log(error);
        });
    };

    return (
      <AnimatedButton
        localizationKey="currency_button"
        textStyle={{color: 'white'}}
        onPress={onPressHandler}
        show={Boolean(Object.keys(selectedCountry).length)}
      />
    );
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: SPENDLESS_BLUE,
          alignItems: 'center',
        }}>
        <LocalizedText
          localizationKey={'currency_message'}
          style={styles.title}
        />
        <View style={styles.listContainer}>
          <FlatList
            data={Data.countries}
            renderItem={({item}) => {
              return <this.Item country={item} />;
            }}
            keyExtractor={country => country.id}
            ItemSeparatorComponent={() => (
              <View style={{height: 0.4, backgroundColor: 'grey'}} />
            )}
          />
        </View>
        {this._renderAcceptButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  listContainer: {
    height: HEIGHT * 0.55,
    width: WIDTH * 0.75,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: 25,
    maxWidth: WIDTH * 0.75,
    marginBottom: 20,
  },
  countryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    flexDirection: 'row',
    width: WIDTH * 0.75,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SPENDLESS_LIGHT_BLUE,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});

export default Currency;
