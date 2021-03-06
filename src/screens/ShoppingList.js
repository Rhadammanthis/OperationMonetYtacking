import React, {Component, useState, useEffect} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Animated,
} from 'react-native';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/FontAwesome5';
import firebase from 'firebase';
import {SPENDLESS_BLUE, SPENDLESS_LIGHT_BLUE} from '../data/consts';
import LocalizedText from '../components/LocalizedText';
import Pusher from '../data/pusher';
import {translate} from '../localization';

class ShoppingList extends Component {
  constructor(props) {
    super(props);
    this.state = {refresh: false, extraItemText: ''};
    this.code = this.props.navigation.getParam('code', null);

    this.pusher = new Pusher(this.code);

    console.log('IN SHOP');
  }

  componentDidMount() {
    this.pusher
      .fetchShoppingList()
      .then(list => {
        console.log('LIST', list);
        this.shoppingList = list;
        this.forceUpdate();
      })
      .catch(reason => {
        console.log('Error', reason);
      });
  }

  fetchData = async () => {
    try {
      let snapshot = await firebase
        .database()
        .ref(`/${this.code}/shopping`)
        .once('value');
      return snapshot.val();
    } catch (error) {
      return error;
    }
  };

  checkbox = ({state, title, index}) => {
    const [active, setActive] = useState(state);
    const [animated, setAnimated] = useState(new Animated.Value(0));

    useEffect(() => {
      //To account for a bug that would persist the state of the checkbox even after deletion
      setActive(this.shoppingList[index].active);
    }, [index]);

    let interpolatedValue = animated.interpolate({
      inputRange: [0, 1],
      outputRange: [40, -20],
    });

    let animation = Animated.spring(animated, {
      toValue: 1,
      duration: 200,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    });

    let reverseAnimation = Animated.spring(animated, {
      toValue: 0,
      duration: 200,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    });

    // let onCheckPressed = () => {
    //     setActive(!active);
    //     this.shoppingList[index].active = !active;
    //     this.updateData(`/${this.code}/shopping/${index}/`, { active: !active })
    // }

    // let onDeletePressed = () => {
    //     console.log(`${index} should be deleted`); this.shoppingList.splice(index, 1);
    //     this.setState({ refresh: !this.state.refresh });
    //     this.pushData(`/${this.code}/shopping/`, this.shoppingList)
    // }

    return (
      <View style={{flexDirection: 'row'}}>
        <View
          key={index}
          style={{
            flexDirection: 'row',
            marginHorizontal: 20,
            flex: 1,
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={evt => {
              setActive(!active);
              this.shoppingList[index].active = !active;
              this.pusher.updateShoppingList(index, {active: !active});
            }}>
            <View
              style={[
                styles.checkBox,
                {
                  backgroundColor: active
                    ? SPENDLESS_LIGHT_BLUE
                    : SPENDLESS_BLUE,
                },
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              animation.start();
              setTimeout(() => {
                reverseAnimation.start();
              }, 2000);
            }}>
            <Text style={styles.item}> {title} </Text>
          </TouchableOpacity>
        </View>
        <Animated.View
          style={[
            styles.deleteButton,
            {transform: [{translateX: interpolatedValue}]},
          ]}>
          <TouchableOpacity
            onPress={evt => {
              console.log(`${index} should be deleted`);
              this.shoppingList.splice(index, 1);
              this.setState({refresh: !this.state.refresh});
              this.pusher.pushShoppingList(this.shoppingList);
            }}>
            <Icon color={'white'} size={20} name="times-circle" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  _renderShoppingList = shoppingList => {
    if (shoppingList === null) return null;

    return (
      <FlatList
        data={shoppingList}
        extraData={this.shoppingList}
        renderItem={({item, index, separators}) => {
          return (
            <this.checkbox
              index={index}
              title={item.title}
              state={item.active}
            />
          );
        }}
        ItemSeparatorComponent={() => (
          <View style={{height: 0.4, marginVertical: 5}} />
        )}
      />
    );
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: SPENDLESS_BLUE,
        }}>
        <LocalizedText
          localizationKey={'shopping_list_title'}
          allowFontScaling
          style={{color: 'white', fontSize: 40, margin: 20, paddingRight: 45}}
        />
        {this._renderShoppingList(this.shoppingList)}
        <View style={{flex: 1}} />
        <View
          style={{
            flexDirection: 'row',
            margin: 10,
            justifyContent: 'space-between',
          }}>
          <TextInput
            style={{flex: 1, backgroundColor: 'white', borderRadius: 10, height: 50, paddingLeft: 10}}
            placeholder={translate('shopping_list_hint')}
            value={this.state.extraItemText}
            onChangeText={text => this.setState({extraItemText: text})}
          />
          <ActionButton
            onPress={() => {
              if (this.state.extraItemText.length === 0) return;
              this.shoppingList = this.shoppingList || [];
              this.shoppingList.push({
                title: this.state.extraItemText,
                active: false,
              });
              this.setState({refresh: !this.state.refresh, extraItemText: ''});
              this.pusher.pushShoppingList(this.shoppingList);
            }}
            renderIcon={active => {
              return <Icon color={'white'} size={15} name="plus" />;
            }}
            spacing={15}
            offsetX={10}
            offsetY={5}
            fixNativeFeedbackRadius={true}
            size={40}
            buttonColor={SPENDLESS_LIGHT_BLUE}
          />
        </View>
        <ActionButton
          onPress={() => {
            this.shoppingList = [];
            this.setState({refresh: !this.state.refresh});
            this.pusher.pushShoppingList(this.shoppingList);
          }}
          renderIcon={active => {
            return <Icon color={'white'} size={20} name="trash-alt" />;
          }}
          verticalOrientation="down"
          position="right"
          spacing={15}
          offsetX={20}
          offsetY={30}
          fixNativeFeedbackRadius={true}
          size={45}
          buttonColor={'#AA3C3B'}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  checkBox: {
    height: 30,
    width: 30,
    borderWidth: 1,
    borderColor: SPENDLESS_LIGHT_BLUE,
    borderRadius: 20,
  },
  item: {
    flex: 1,
    color: 'white',
    textAlign: 'left',
    fontSize: 20,
    marginHorizontal: 20,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: '#AA3C3B',
  },
});

export default ShoppingList;
