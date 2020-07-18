import React, {Component} from 'react';
import {LocaleConfig, CalendarList} from 'react-native-calendars';
import {
  StyleSheet,
  Keyboard,
  View,
  Text,
  StatusBar,
  Button,
  TextInput,
  BackHandler,
  Animated,
  TouchableOpacity,
  LayoutAnimation,
} from 'react-native';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Modal from 'react-native-modalbox';
import {FlatGrid} from 'react-native-super-grid';
import {translate} from '../localization';

import ExpensesItem from '../components/ExpensesItem';
import Draggable from '../components/Draggable';
import SummaryModal from '../components/SummaryModal';
import {
  applyMoneyMask,
  HEIGHT,
  WIDTH,
  SPENDLESS_BLUE,
  SPENDLESS_LIGHT_BLUE,
} from '../data/consts';
import LocalizedText from '../components/LocalizedText';
import {getColor, Categories, getName, getIcon} from '../data/categories';
import DataStore from '../data/dataStore';

const calendarDayTextSize = HEIGHT < 600 ? 14 : 17;
const calendarMonthTextSize = HEIGHT < 600 ? 20 : 30;

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedDay: null,
      modalVisible: false,
      catSelected: Categories.Vegtables,
      amount: null,
      refresh: false,
      renderTotal: false,
      anim: new Animated.Value(0),
      open: false,
      showSummary: false,
      lastDay: null,
      top: Math.floor(HEIGHT / 2),
      selectedSlice: {
        label: Categories.Vegtables,
        value: 0,
      },
      labelWidth: 0,
      currentMonth: '',
    };

    LocaleConfig.locales['es'] = {
      monthNames: [
        translate('system_january'),
        translate('system_february'),
        translate('system_march'),
        translate('system_april'),
        translate('system_may'),
        translate('system_june'),
        translate('system_july'),
        translate('system_august'),
        translate('system_september'),
        translate('system_october'),
        translate('system_november'),
        translate('system_december'),
      ],
      monthNamesShort: [
        'Janv.',
        'Févr.',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juil.',
        'Août',
        'Sept.',
        'Oct.',
        'Nov.',
        'Déc.',
      ],
      dayNames: [
        'Dimanche',
        'Lundi',
        'Mardi',
        'Mercredi',
        'Jeudi',
        'Vendredi',
        'Samedi',
      ],
      dayNamesShort: [
        translate('system_sunday_short'),
        translate('system_monday_short'),
        translate('system_tuesday_short'),
        translate('system_wednesday_short'),
        translate('system_thursday_short'),
        translate('system_friday_short'),
        translate('system_saturday_short'),
      ],
      today: "Aujourd'hui",
    };
    LocaleConfig.defaultLocale = 'es';

    const {navigation} = this.props;

    let data = navigation.getParam('expensesData', null).expenses;
    this.shopping = navigation.getParam('expensesData', null).shopping;
    this.code = navigation.getParam('code', null);
    this.currency = navigation.getParam('currency', null);

    this.dataStore = new DataStore(data, this.code);

    this.currentMonth = new Date().toISOString().substring(0, 7);
    this.statusBarTheme = 'light-content';

    StatusBar.setBackgroundColor('#005577', true);
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (this.props.navigation.isFocused()) {
        if (this.state.showSummary) {
          this.setState({showSummary: false});
          return true;
        } else {
          BackHandler.exitApp();
        }
      }
    });
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  _ondDayPressed = dateString => {
    LayoutAnimation.configureNext({
      duration: 500,
      create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.scaleXY,
        springDamping: 1,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 1,
      },
      delete: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.opacity,
        springDamping: 1,
      },
    });

    this.dataStore.selectDay(dateString);
    this.setState({selectedDay: dateString});
  };

  onUpdated = (cat, amount) => {
    this.dataStore.updateDaysData(this.state.selectedDay, cat, amount);
    this.forceUpdate();
  };

  _shouldRenderActionButton = () => {
    if (this.state.selectedDay)
      return (
        <ActionButton
          offsetX={10}
          offsetY={10}
          spacing={15}
          fixNativeFeedbackRadius={true}
          position="right"
          backdrop={
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: HEIGHT,
                width: WIDTH,
                backgroundColor: 'black',
                opacity: 0.7,
              }}
            />
          }
          size={45}
          buttonColor="rgba(0, 173, 245, 1)">
          <ActionButton.Item
            textStyle={{color: 'white'}}
            textContainerStyle={{
              borderRadius: 5,
              backgroundColor: getColor(Categories.Vegtables),
              borderColor: getColor(Categories.Vegtables),
            }}
            buttonColor={getColor(Categories.Vegtables)}
            title={getName(Categories.Vegtables)}
            onPress={this.categoryButtonPressed.bind(
              this,
              Categories.Vegtables,
            )}>
            <Icon
              size={20}
              name={getIcon(Categories.Vegtables)}
              color={'white'}
            />
          </ActionButton.Item>
          <ActionButton.Item
            textStyle={{color: 'white'}}
            textContainerStyle={{
              borderRadius: 5,
              backgroundColor: getColor(Categories.Fruits),
              borderColor: getColor(Categories.Fruits),
            }}
            buttonColor={getColor(Categories.Fruits)}
            title={getName(Categories.Fruits)}
            onPress={this.categoryButtonPressed.bind(this, Categories.Fruits)}>
            <Icon size={20} name={getIcon(Categories.Fruits)} color={'white'} />
          </ActionButton.Item>
          <ActionButton.Item
            textStyle={{color: 'white'}}
            textContainerStyle={{
              borderRadius: 5,
              backgroundColor: getColor(Categories.Dairy),
              borderColor: getColor(Categories.Dairy),
            }}
            buttonColor={getColor(Categories.Dairy)}
            title={getName(Categories.Dairy)}
            onPress={this.categoryButtonPressed.bind(this, Categories.Dairy)}>
            <Icon size={20} name={getIcon(Categories.Dairy)} color={'white'} />
          </ActionButton.Item>
          <ActionButton.Item
            textStyle={{color: 'white'}}
            textContainerStyle={{
              borderRadius: 5,
              backgroundColor: getColor(Categories.Meet),
              borderColor: getColor(Categories.Meet),
            }}
            buttonColor={getColor(Categories.Meet)}
            title={getName(Categories.Meet)}
            onPress={this.categoryButtonPressed.bind(this, Categories.Meet)}>
            <Icon size={20} name={getIcon(Categories.Meet)} color={'white'} />
          </ActionButton.Item>
          <ActionButton.Item
            textStyle={{color: 'white'}}
            textContainerStyle={{
              borderRadius: 5,
              backgroundColor: getColor(Categories.Sweets),
              borderColor: getColor(Categories.Sweets),
            }}
            buttonColor={getColor(Categories.Sweets)}
            title={getName(Categories.Sweets)}
            onPress={this.categoryButtonPressed.bind(this, Categories.Sweets)}>
            <Icon size={20} name={getIcon(Categories.Sweets)} color={'white'} />
          </ActionButton.Item>
          <ActionButton.Item
            textStyle={{color: 'white'}}
            textContainerStyle={{
              borderRadius: 5,
              backgroundColor: getColor(Categories.Cereals),
              borderColor: getColor(Categories.Cereals),
            }}
            buttonColor={getColor(Categories.Cereals)}
            title={getName(Categories.Cereals)}
            onPress={this.categoryButtonPressed.bind(this, Categories.Cereals)}>
            <Icon
              size={20}
              name={getIcon(Categories.Cereals)}
              color={'white'}
            />
          </ActionButton.Item>
          <ActionButton.Item
            textStyle={{color: 'white'}}
            textContainerStyle={{
              borderRadius: 5,
              backgroundColor: getColor(Categories.Cleaning),
              borderColor: getColor(Categories.Cleaning),
            }}
            buttonColor={getColor(Categories.Cleaning)}
            title={getName(Categories.Cleaning)}
            onPress={this.categoryButtonPressed.bind(
              this,
              Categories.Cleaning,
            )}>
            <Icon
              size={20}
              name={getIcon(Categories.Cleaning)}
              color={'white'}
            />
          </ActionButton.Item>
          <ActionButton.Item
            textStyle={{color: 'white'}}
            textContainerStyle={{
              borderRadius: 5,
              backgroundColor: getColor(Categories.Other),
              borderColor: getColor(Categories.Other),
            }}
            buttonColor={getColor(Categories.Other)}
            title={getName(Categories.Other)}
            onPress={this.categoryButtonPressed.bind(this, Categories.Other)}>
            <Icon size={20} name={getIcon(Categories.Other)} color={'white'} />
          </ActionButton.Item>
        </ActionButton>
      );

    return null;
  };

  categoryButtonPressed = category => {
    this.setState({catSelected: category});
    this.setModalVisible(!this.state.modalVisible);
  };

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  _renderDayTotal = () => {
    var daysTotal = this.dataStore.getDaysTotal();

    if (daysTotal) {
      return (
        <LocalizedText
          localizationKey={'main_day_total'}
          style={{color: 'white', fontWeight: 'bold', fontSize: 17}}>
          {applyMoneyMask(daysTotal)} {this.currency}
        </LocalizedText>
      );
    }

    return null;
  };

  updateCurrentMonth = date => {
    this.currentMonth = date.dateString.substring(0, 7);
  };

  render() {

    let monthCategoriesTotalsArray = this.dataStore.getMontsCategoriesTotals(
      this.currentMonth,
    );
    let monthsTotal = this.dataStore.getMontsTotal(this.currentMonth);
    const {showSummary} = this.state;


    return (
      <View
        style={{
          flexDirection: 'column',
          flex: 1,
          backgroundColor: SPENDLESS_BLUE,
        }}>
        <StatusBar barStyle={this.statusBarTheme} />
        <CalendarList
          theme={{
            calendarBackground: SPENDLESS_BLUE,
            dayTextColor: 'white',
            monthTextColor: 'white',
            textDayFontSize: calendarDayTextSize,
            textMonthFontSize: calendarMonthTextSize,
            textDayHeaderFontSize: calendarDayTextSize,
          }}
          onVisibleMonthsChange={months => {
            this.updateCurrentMonth(months[0]);
          }}
          horizontal={true}
          pagingEnabled={true}
          calendarWidth={WIDTH}
          calendarHeight={400}
          onMonthChange={date => {
            this.updateCurrentMonth(date);
          }}
          monthFormat={'MMMM'}
          onDayPress={day => {
            this._ondDayPressed(day.dateString);
          }}
          markedDates={this.dataStore.markedDates}
        />
        <Draggable
          style={{
            height: HEIGHT * 0.73,
            flexDirection: 'column',
            backgroundColor: '#EEE',
            borderTopRightRadius: 15,
            borderTopLeftRadius: 15,
          }}>
          <FlatGrid
            style={{flex: 1}}
            itemDimension={(WIDTH - 50) / 3}
            items={this.dataStore.dayExpenses}
            renderItem={({item, index}) => (
              <ExpensesItem
                item={item}
                index={index}
                onPress={() => {
                  this.categoryButtonPressed(item.key);
                }}
                navigation={this.props.navigation}
                currency={this.currency}
                history={this.dataStore.history[item.key]}
                onUpdated={this.onUpdated}
              />
            )}
          />
        </Draggable>
        <View
          style={{
            backgroundColor: '#005577',
            width: WIDTH,
            alignItems: 'center',
            justifyContent: 'center',
            height: 60,
            position: 'absolute',
            bottom: 0,
          }}>
          {this._renderDayTotal()}
        </View>
        {/* ***************** MODAL ****************** */}
        <Modal
          style={{
            height: 190,
            width: 350,
            borderRadius: 10,
            flexDirection: 'row',
          }}
          onClosed={() => {
            this.setModalVisible(false);
          }}
          position={'center'}
          isOpen={this.state.modalVisible}>
          <View
            style={{
              height: 190,
              width: 100,
              justifyContent: 'center',
              alignItems: 'center',
              borderTopLeftRadius: 10,
              borderBottomLeftRadius: 10,
              backgroundColor: getColor(this.state.catSelected),
            }}>
            <Icon
              size={70}
              color={'white'}
              name={getIcon(this.state.catSelected)}
            />
          </View>
          <View
            style={{
              flex: 1,
              padding: 10,
              justifyContent: 'space-between',
            }}>
            <Text style={{fontSize: 20}}>
              {translate('main_add_expense_title')}
            </Text>
            <Text style={{fontSize: 15}}>
              {translate('main_add_expense_content')}
            </Text>
            <View style={{alignItems: 'center', flexDirection: 'row'}}>
              <TextInput
                onSubmitEditing={Keyboard.dismiss}
                placeholder={translate('main_add_expense_hint')}
                value={this.state.amount}
                onChangeText={text => this.setState({amount: text})}
                keyboardType={'numeric'}
                style={{
                  flex: 1,
                  marginVertical: 0,
                  borderBottomWidth: 2,
                  borderColor: getColor(this.state.catSelected),
                  height: 50,
                  paddingLeft: 10,
                }}
              />
              <Text> {this.currency} </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                this.dataStore.addExpense(
                  this.state.selectedDay,
                  this.state.catSelected,
                  this.state.amount,
                );
                this.setState({amount: ''});
                this.setModalVisible(!this.state.modalVisible);
              }}
              style={{
                color: 'white',
                padding: 10,
              }}
              color={getColor(this.state.catSelected)}>
              <Text
                style={{
                  fontSize: 15,
                  marginTop: 5,
                  color: getColor(this.state.catSelected),
                }}>
                {translate('main_add_expense_button')}
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <SummaryModal
          show={showSummary}
          currency={this.currency}
          onClose={() => {
            this.setState({showSummary: false});
          }}
          monthTotal={monthsTotal}
          categoriesTotal={monthCategoriesTotalsArray}
        />
        <ActionButton
          onPress={() => {
            this.setState({showSummary: true});
          }}
          renderIcon={active => {
            return <Icon color={'white'} size={15} name="chart-line" />;
          }}
          offsetY={15}
          offsetX={120}
          spacing={15}
          verticalOrientation="down"
          position="right"
          fixNativeFeedbackRadius={true}
          backdrop={
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: HEIGHT,
                width: WIDTH,
                backgroundColor: 'black',
                opacity: 1,
              }}
            />
          }
          size={40}
          buttonColor={SPENDLESS_LIGHT_BLUE}
        />
        <ActionButton
          onPress={() => {
            console.log('CODE', this.code);
            this.props.navigation.navigate('ShoppingList', {
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
          buttonColor={SPENDLESS_LIGHT_BLUE}
        />
        <ActionButton
          onPress={() => {
            console.log('CODE', this.code);
            this.props.navigation.navigate('Profile', {code: this.code});
          }}
          renderIcon={active => {
            return <Icon color={'white'} size={15} name="user" />;
          }}
          offsetY={15}
          offsetX={20}
          verticalOrientation="down"
          position="right"
          spacing={15}
          fixNativeFeedbackRadius={true}
          size={40}
          buttonColor={SPENDLESS_LIGHT_BLUE}
        />
        {this._shouldRenderActionButton()}
      </View>
    );
  }
}

export default Main;
