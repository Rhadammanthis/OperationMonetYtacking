import React, {Component} from 'react';
import {LocaleConfig, CalendarList} from 'react-native-calendars';
import {
  View,
  StatusBar,
  BackHandler,
  Animated,
  LayoutAnimation,
  StyleSheet,
} from 'react-native';
import {FlatGrid} from 'react-native-super-grid';
import {translate} from '../localization';

import ExpensesItem from '../components/ExpensesItem';
import Draggable from '../components/Draggable';
import SummaryModal from '../components/SummaryModal';
import {HEIGHT, WIDTH, SPENDLESS_BLUE} from '../data/consts';
import {Categories} from '../data/categories';
import DataStore from '../data/dataStore';
import DropUpActionButton from '../components/DropUpActionButton';
import ToolTipMenu from '../components/ToolTipMenu';
import DaysTotal from '../components/DaysTotal';
import {palette} from '../theme';
import LogExpenseModal from '../components/LogExpenseModal';

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

  onCategoryActionButtonPressed = category => {
    this.setState({catSelected: category});
    this.setState({modalVisible: true});
  };

  hideModal = () => {
    this.setState({modalVisible: false});
  };

  updateCurrentMonth = date => {
    this.currentMonth = date.dateString.substring(0, 7);
  };

  render() {
    let monthCategoriesTotalsArray = this.dataStore.getMontsCategoriesTotals(
      this.currentMonth,
    );

    let monthsTotal = this.dataStore.getMontsTotal(this.currentMonth);

    let daysTotal = this.dataStore.getDaysTotal();

    const {showSummary, selectedDay, catSelected, modalVisible} = this.state;

    return (
      <View style={styles.container}>
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
        <Draggable style={[styles.draggableContainer, {height: HEIGHT * 0.73}]}>
          <FlatGrid
            style={styles.gridContainer}
            itemDimension={(WIDTH - 50) / 3}
            items={this.dataStore.dayExpenses}
            renderItem={({item, index}) => (
              <ExpensesItem
                item={item}
                index={index}
                onPress={() => {
                  this.onCategoryActionButtonPressed(item.key);
                }}
                navigation={this.props.navigation}
                currency={this.currency}
                history={this.dataStore.history[item.key]}
                onUpdated={this.onUpdated}
              />
            )}
          />
        </Draggable>
        <DaysTotal currency={this.currency} total={daysTotal} />
        <LogExpenseModal
          category={catSelected}
          onExpenseLoggedHandler={amount => {
            this.dataStore.addExpense(selectedDay, catSelected, amount);
          }}
          onModalCLosed={this.hideModal}
          visible={modalVisible}
        />
        <SummaryModal
          show={showSummary}
          currency={this.currency}
          onClose={() => {
            this.setState({showSummary: false});
          }}
          monthTotal={monthsTotal}
          categoriesTotal={monthCategoriesTotalsArray}
        />
        <ToolTipMenu
          navigation={this.props.navigation}
          modalStateHandler={modalState => {
            this.setState({showSummary: modalState});
          }}
        />
        <DropUpActionButton
          show={selectedDay}
          categoryButtonPressed={this.onCategoryActionButtonPressed}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: SPENDLESS_BLUE,
  },
  draggableContainer: {
    flexDirection: 'column',
    backgroundColor: palette.basic.lightGray,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
  },
  gridContainer: {flex: 1},
});

export default Main;
