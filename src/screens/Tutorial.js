import React, {Component} from 'react';
import {
  TouchableOpacity,
  View,
  Image,
  Animated,
  StyleSheet,
} from 'react-native';
import Carousel from '@rhysforyou/react-native-carousel';
import {SPENDLESS_LIGHT_BLUE, SPENDLESS_BLUE} from '../data/consts';
import LocalizedText from '../components/LocalizedText';

class Tutorial extends Component {
  constructor(props) {
    super(props);
    this.state = {animCloseButton: new Animated.Value(1)};
  }

  componentDidMount() {}

  _renderAcceptButton = () => {
    const {animCloseButton} = this.state;

    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigation.navigate('Currency');
        }}
        style={{borderRadius: 20}}>
        <Animated.View
          style={[
            styles.button,
            {
              transform: [
                {
                  translateY: animCloseButton.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, -10],
                  }),
                },
              ],
            },
          ]}>
          <LocalizedText
            localizationKey={'tutorial_button'}
            style={{color: 'white'}}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  render() {
    const springAnimation = Animated.spring(this.state.animCloseButton, {
      toValue: 1,
      duration: 200,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    });

    return (
      <View
        style={{
          backgroundColor: SPENDLESS_BLUE,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <LocalizedText
          localizationKey={'tutorial_header_title'}
          style={styles.header}
        />
        <Carousel
          style={{backgroundColor: SPENDLESS_BLUE}}
          onEndReached={() => {
            console.log('THE END');
            springAnimation.start();
          }}
          data={[
            {
              id: '0',
              title: 'tutorial_card_0_title',
              description: 'tutorial_card_0_description',
              image: require('../../img/screen_grab_0_smol.png'),
            },
            {
              id: '2',
              title: 'tutorial_card_1_title',
              description: 'tutorial_card_1_description',
              image: require('../../img/screen_grab_1_smol.png'),
            },
            {
              id: '3',
              title: 'tutorial_card_2_title',
              description: 'tutorial_card_2_description',
              image: require('../../img/screen_grab_2_smol.png'),
            },
            {
              id: '4',
              title: 'tutorial_card_3_title',
              description: 'tutorial_card_3_description',
              image: require('../../img/screen_grab_3_smol.png'),
            },
            {
              id: '5',
              title: 'tutorial_card_4_title',
              description: 'tutorial_card_4_description',
              image: require('../../img/screen_grab_4_smol.png'),
            },
          ]}
          renderItem={info => (
            <View style={{flex: 1}}>
              <LocalizedText
                localizationKey={info.item.title}
                style={{color: '#000000DD', textAlign: 'center', fontSize: 20}}
              />
              <LocalizedText
                localizationKey={info.item.description}
                style={{
                  color: '#000000DD',
                  textAlign: 'center',
                  fontSize: 17,
                  marginVertical: 5,
                }}
              />
              <Image
                style={{flex: 1, aspectRatio: 0.5, alignSelf: 'center'}}
                source={info.item.image}
              />
            </View>
          )}
          keyExtractor={item => item.id}
        />
        {this._renderAcceptButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    textAlign: 'center',
    color: 'white',
    fontSize: 30,
    marginVertical: 20,
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

export default Tutorial;
