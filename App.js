/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { LocaleConfig, CalendarList } from 'react-native-calendars';
import {
	StyleSheet,
	Keyboard,
	View, Text,
	StatusBar,
	Button,
	TextInput, BackHandler,
	Animated,
	Platform, LayoutAnimation
} from 'react-native';
import { createAppContainer, createStackNavigator } from "react-navigation";
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Modal from 'react-native-modalbox';
import firebase from 'firebase';
import { FluidNavigator } from 'react-navigation-fluid-transitions'
import { FlatGrid } from 'react-native-super-grid';
import { PieChart } from 'react-native-svg-charts'
import { translate } from "./src/localization"

import Splash from "./src/screens/Splash"
import Profile from "./src/screens/Profile"
import ShoppingList from "./src/screens/ShoppingList"
import SignUpModal from "./src/screens/SignUpModal"
import Tutorial from "./src/screens/Tutorial"
import Currency from "./src/screens/Currency"
import History from "./src/screens/History"
import ExpensesItem from './src/components/ExpensesItem';
import Draggable from './src/components/Draggable'
import { applyMoneyMask, HEIGHT, WIDTH, SPENDLESS_BLUE, SPENDLESS_LIGHT_BLUE } from './src/data/consts';
import LocalizedText from './src/components/LocalizedText';
import { getColor, Categories, getName, getIcon } from './src/data/categories';



const calendarDayTextSize = HEIGHT < 600 ? 14 : 15
const calendarMonthTextSize = HEIGHT < 600 ? 20 : 30

class Main extends Component {
	constructor(props) {
		super(props);

		console.log("I GOT TO MAIN")

		this.state = {
			selectedDay: null, modalVisible: false, catSelected: "vgt",
			amount: null, dayExpenses: [], refresh: false, renderTotal: false, anim: new Animated.Value(0),
			open: false, showSummary: false, lastDay: null, top: Math.floor(HEIGHT / 2), selectedSlice: {
				label: 'vgt', value: 0
			}, labelWidth: 0
		};

		LocaleConfig.locales['es'] = {
			monthNames: [translate("system_january"), translate("system_february"), translate("system_march"), translate("system_april"),
			translate("system_may"), translate("system_june"), translate("system_july"), translate("system_august"),
			translate("system_september"), translate("system_october"), translate("system_november"), translate("system_december")],
			monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
			dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
			dayNamesShort: [translate("system_sunday_short"), translate("system_monday_short"), translate("system_tuesday_short"),
			translate("system_wednesday_short"), translate("system_thursday_short"), translate("system_friday_short"), translate("system_saturday_short")],
			today: 'Aujourd\'hui'
		};

		LocaleConfig.defaultLocale = 'es';

		const { navigation } = this.props;
		this.data = navigation.getParam('moneyData', null).expenses;
		this.shopping = navigation.getParam('moneyData', null).shopping;
		this.code = navigation.getParam('code', null);
		this.currency = navigation.getParam('currency', null);
		this.markedDates = {}
		Object.keys(this.data).map((day, i) => {
			this.markedDates[day] = { marked: true }
		})

		this.currentMonth = new Date().toISOString().substring(0, 7)


		console.log("Data", this.data)

		this.dataSet = null

		this.statusBarTheme = Platform.OS === 'android' ? 'light-content' : 'dark-content'

		StatusBar.setBackgroundColor("#005577", true)

		this.animatedOffset = new Animated.Value(0)
	}

	componentDidMount() {

		this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {

			if (this.props.navigation.isFocused()) {
				if (this.state.showSummary) {
					this.setState({ showSummary: false })
					return true
				}
				else{
					BackHandler.exitApp()
				}
			}
		});

	}

	componentWillUnmount() {
		this.backHandler.remove();
	}

	_ondDayPressed = (dateString) => {

		LayoutAnimation.configureNext({
			duration: 500,
			create: {
				type: LayoutAnimation.Types.spring,
				property: LayoutAnimation.Properties.scaleXY,
				springDamping: 1
			},
			update: {
				type: LayoutAnimation.Types.spring,
				property: LayoutAnimation.Properties.opacity,
				springDamping: 1
			},
			delete: {
				type: LayoutAnimation.Types.spring,
				property: LayoutAnimation.Properties.opacity,
				springDamping: 1,
			}
		})

		this.markedDates = { ...this.markedDates, [dateString]: { ...this.markedDates[dateString], selected: true, disableTouchEvent: false } }

		if (this.state.selectedDay !== null)
			this.markedDates = { ...this.markedDates, [this.state.selectedDay]: { ...this.markedDates[this.state.selectedDay], selected: false, disableTouchEvent: false } }

		this.setState({ selectedDay: dateString })
		this.parseTableData(dateString)
	}

	parseTableData = (dayString) => {

		if (this.data[dayString] == null)
			return this.setState({ dayExpenses: [] })

		let dayData = dayString ? this.data[dayString].expenses || null : null

		this.setState({
			dayExpenses: dayData ? Object.keys(dayData).map((key, index) => {
				return { key: key, amount: dayData[key] }
			}) : null
		})
	}

	onUpdated = (cat, amount) => {
		if (amount <= 0) {
			delete this.data[this.state.selectedDay].expenses[cat]
			this.markedDates = { ...this.markedDates, [this.state.selectedDay]: { ...this.markedDates[this.state.selectedDay], marked: false } }
		}
		else
			this.data[this.state.selectedDay].expenses[cat] = amount

		this.pushData(this.data)
		this.parseTableData(this.state.selectedDay)
		this.forceUpdate()
	}

	_shouldRenderActionButton = () => {
		if (this.state.selectedDay)
			return (
				<ActionButton offsetX={10} offsetY={10} spacing={15} fixNativeFeedbackRadius={true} position="right" backdrop={
					<View style={{ position: 'absolute', top: 0, left: 0, height: HEIGHT, width: WIDTH, backgroundColor: 'black', opacity: 0.7 }}></View>
				} size={47} buttonColor="rgba(0, 173, 245, 1)">
					<ActionButton.Item textStyle={{ color: 'white' }}
						textContainerStyle={{ borderRadius: 5, backgroundColor: getColor(Categories.Vegtables), borderColor: getColor(Categories.Vegtables) }}
						buttonColor={getColor(Categories.Vegtables)} title={getName(Categories.Vegtables)} onPress={this.categoryButtonPressed.bind(this, Categories.Vegtables)}>
						<Icon size={20} name={getIcon(Categories.Vegtables)} color={'white'} />
					</ActionButton.Item>
					<ActionButton.Item textStyle={{ color: 'white' }}
						textContainerStyle={{ borderRadius: 5, backgroundColor: getColor(Categories.Fruits), borderColor: getColor(Categories.Fruits) }}
						buttonColor={getColor(Categories.Fruits)} title={getName(Categories.Fruits)} onPress={this.categoryButtonPressed.bind(this, Categories.Fruits)}>
						<Icon size={20} name={getIcon(Categories.Fruits)} color={'white'} />
					</ActionButton.Item>
					<ActionButton.Item textStyle={{ color: 'white' }}
						textContainerStyle={{ borderRadius: 5, backgroundColor: getColor(Categories.Meet), borderColor: getColor(Categories.Meet) }}
						buttonColor={getColor(Categories.Meet)} title={getName(Categories.Meet)} onPress={this.categoryButtonPressed.bind(this, Categories.Meet)}>
						<Icon size={20} name={getIcon(Categories.Meet)} color={'white'} />
					</ActionButton.Item>
					<ActionButton.Item textStyle={{ color: 'white' }}
						textContainerStyle={{ borderRadius: 5, backgroundColor: getColor(Categories.Sweets), borderColor: getColor(Categories.Sweets) }}
						buttonColor={getColor(Categories.Sweets)} title={getName(Categories.Sweets)} onPress={this.categoryButtonPressed.bind(this, Categories.Sweets)}>
						<Icon size={20} name={getIcon(Categories.Sweets)} color={'white'} />
					</ActionButton.Item>
					<ActionButton.Item textStyle={{ color: 'white' }}
						textContainerStyle={{ borderRadius: 5, backgroundColor: getColor(Categories.Cereals), borderColor: getColor(Categories.Cereals) }}
						buttonColor={getColor(Categories.Cereals)} title={getName(Categories.Cereals)} onPress={this.categoryButtonPressed.bind(this, Categories.Cereals)}>
						<Icon size={20} name={getIcon(Categories.Cereals)} color={'white'} />
					</ActionButton.Item>
					<ActionButton.Item textStyle={{ color: 'white' }}
						textContainerStyle={{ borderRadius: 5, backgroundColor: getColor(Categories.Cleaning), borderColor: getColor(Categories.Cleaning) }}
						buttonColor={getColor(Categories.Cleaning)} title={getName(Categories.Cleaning)} onPress={this.categoryButtonPressed.bind(this, Categories.Cleaning)}>
						<Icon size={20} name={getIcon(Categories.Cleaning)} color={'white'} />
					</ActionButton.Item>
					<ActionButton.Item textStyle={{ color: 'white' }}
						textContainerStyle={{ borderRadius: 5, backgroundColor: getColor(Categories.Other), borderColor: getColor(Categories.Other) }}
						buttonColor={getColor(Categories.Other)} title={getName(Categories.Other)} onPress={this.categoryButtonPressed.bind(this, Categories.Other)}>
						<Icon size={20} name={getIcon(Categories.Other)} color={'white'} />
					</ActionButton.Item>
				</ActionButton>
			)

		return null
	}

	_renderSummaryModal = (currentMonth) => {

		let totals = {}, total = 0

		Object.keys(this.data).map((day, i) => {

			if (day.indexOf(currentMonth) == -1)
				return null

			Object.keys(this.data[day].expenses).map((category, i) => {
				totals[category] = totals[category] || 0
				totals[category] += this.data[day].expenses[category]
			})
		})

		console.log("TOTALS 2", totals)

		//To prevent excessive state updates
		if (this.state.showSummary === true && this.state.selectedSlice.value === 0)
			this.setState({ selectedSlice: { value: applyMoneyMask(totals.vgt), label: 'vgt' } })

		const { selectedSlice } = this.state;
		const { label, value } = selectedSlice;

		const data = Object.keys(totals).map((key, index) => {
			total += totals[key]
			return {
				key,
				value: totals[key],
				svg: { fill: getColor(key) },
				arc: { outerRadius: '90%', padAngle: label === key ? 0.05 : 0 },
				onPress: () => {
					LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
					this.setState({ selectedSlice: { label: key, value: applyMoneyMask(totals[key]) } })
				}
			}
		})

		_renderPieChart = () => {

			return (
				total > 0 ?
					<View style={{ justifyContent: 'center', flex: 1 }}>
						<PieChart
							style={{ height: HEIGHT * 0.45 }}
							outerRadius={'85%'}
							innerRadius={'55%'}
							data={data}
						/>
						<View style={{
							left: (350 / 2 - (WIDTH * 0.150)), position: 'absolute', width: WIDTH * 0.3, height: WIDTH * 0.3,
							borderRadius: WIDTH * 0.150, borderWidth: 3, borderColor: getColor(label), backgroundColor: "#FFFFFFEE",
							padding: 5, alignItems: 'center', justifyContent: 'center'
						}}>
							<Icon style={{ marginVertical: 5 }} size={30} color={getColor(label)} name={getIcon(label)} />
							<Text style={{ color: getColor(label), marginTop: 5 }}>{getName(label)}</Text>
							<Text style={{ color: getColor(label) }}>{value} {this.currency}</Text>
						</View>
					</View>
					:
					<Text style={{ color: "black", textAlign: 'center', color: 'white', fontSize: 17 }}> {translate("main_monthly_summary_no_data")} </Text>
			)

		}

		return (
			<Modal style={{
				height: HEIGHT * 0.6,
				width: 350,
				borderRadius: 10,
				backgroundColor: SPENDLESS_BLUE
			}} onClosed={() => { this.setState({ showSummary: false, selectedSlice: { label: 'vgt', value: 0 } }) }}
				position={"center"} ref={"modal3"} isOpen={this.state.showSummary}
				animationDuration={350} swipeToClose={false}>
				<Text style={{ textAlign: 'center', paddingLeft: 10, fontSize: 25, color: 'white', paddingVertical: 10 }}>
					{translate("main_monthly_summary_title")}
				</Text>
				<View style={{ justifyContent: 'center', flex: 1 }}>
					{_renderPieChart()}
				</View>
				<Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 20, color: 'white', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: SPENDLESS_BLUE, justifyContent: 'center', alignItems: 'center', paddingVertical: 10 }}>
					{translate("main_monthly_summary_total")} {applyMoneyMask(total)} {this.currency}
				</Text>
			</Modal>
		)
	}

	categoryButtonPressed = (category) => {
		this.setState({ catSelected: category })
		this.setModalVisible(!this.state.modalVisible)
	}

	setModalVisible(visible) {
		this.setState({ modalVisible: visible });
	}

	_renderDayTotal = () => {
		if (this.state.dayExpenses.length > 0) {

			let dailyExpensesSum = 0

			for (let index = 0; index < this.state.dayExpenses.length; index++) {
				dailyExpensesSum += this.state.dayExpenses[index].amount
			}

			return (
				<LocalizedText localizationKey={"main_day_total"} style={{ color: 'white', fontWeight: 'bold', fontSize: 17 }}> {applyMoneyMask(dailyExpensesSum)} {this.currency}</LocalizedText>
			)
		}

		return null
	}

	pushData = async (data) => {
		let snapshot = await firebase.database().ref(`/${this.props.navigation.getParam('code', null)}/expenses`).update(data)
	}

	updateCurrentMonth = (date) => {
		this.currentMonth = date.dateString.substring(0, 7)
	}

	render() {
		return (
			<View style={{ flexDirection: 'column', flex: 1, backgroundColor: SPENDLESS_BLUE }}>
				<StatusBar barStyle={this.statusBarTheme} />
				<CalendarList
					theme={{
						calendarBackground: SPENDLESS_BLUE,
						dayTextColor: 'white',
						monthTextColor: 'white',
						textDayFontSize: calendarDayTextSize,
						textMonthFontSize: calendarMonthTextSize,
						textDayHeaderFontSize: calendarDayTextSize
					}}
					onVisibleMonthsChange={(months) => { this.updateCurrentMonth(months[0]) }}
					horizontal={true}
					pagingEnabled={true}
					calendarWidth={WIDTH}
					calendarHeight={HEIGHT * 0.525}
					onMonthChange={(date) => { this.updateCurrentMonth(date) }}
					monthFormat={'MMMM'}
					onDayPress={(day) => { this._ondDayPressed(day.dateString) }}
					markedDates={this.markedDates}
				/>

				<Draggable style={{
					height: HEIGHT * 0.73, flexDirection: 'column', backgroundColor: '#EEE', borderTopRightRadius: 15, borderTopLeftRadius: 15
				}}>
					<FlatGrid
						style={{ flex: 1 }}
						itemDimension={(WIDTH - 50) / 3}
						items={this.state.dayExpenses}
						renderItem={({ item, index }) => (
							<ExpensesItem item={item} index={index}
								onPress={() => { this.categoryButtonPressed(item.key) }}
								navigation={this.props.navigation}
								currency={this.currency}
								history={this.data[this.state.selectedDay].history[item.key]}
								onUpdated={this.onUpdated} />)
						} />
					<View style={{ backgroundColor: '#005577', width: WIDTH, alignItems: 'center', justifyContent: 'center', height: 70 }}>
						{this._renderDayTotal()}
					</View>
				</Draggable>
				{/* ***************** MODAL ****************** */}
				<Modal style={{
					height: 170,
					width: 350,
					borderRadius: 10,
					flexDirection: 'row'
				}} onClosed={() => { this.setModalVisible(false) }} position={"center"} ref={"modal3"} isOpen={this.state.modalVisible}>
					<View style={{ height: 170, width: 100, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 10, borderBottomLeftRadius: 10, backgroundColor: getColor(this.state.catSelected) }}>
						<Icon size={70} color={"white"} name={getIcon(this.state.catSelected)} />
					</View>
					<View style={{ flex: 1, padding: 10 }}>
						<Text style={{ fontSize: 20 }}> {translate("main_add_expense_title")} </Text>
						<Text style={{ fontSize: 15, marginTop: 5 }}> {translate("main_add_expense_content")} </Text>
						<View style={{ alignItems: 'center', flexDirection: 'row' }}>
							<TextInput onSubmitEditing={Keyboard.dismiss} placeholder={translate("main_add_expense_hint")} value={this.state.amount} onChangeText={(text) => this.setState({ amount: text })} keyboardType={'numeric'} style={{ flex: 1, marginVertical: 0, borderBottomWidth: 2, borderColor: getColor(this.state.catSelected) }} />
							<Text> {this.currency} </Text>
						</View>
						<View style={{ flex: 1 }} />
						<Button onPress={() => {

							if (this.state.amount === null)
								return

							console.log("Data", this.data)

							//Add money to category
							this.data[this.state.selectedDay] = this.data[this.state.selectedDay] || { expenses: {}, history: {} }
							this.data[this.state.selectedDay].expenses[this.state.catSelected] = this.data[this.state.selectedDay].expenses[this.state.catSelected] || 0
							this.data[this.state.selectedDay].expenses[this.state.catSelected] += parseInt(this.state.amount)
							this.parseTableData(this.state.selectedDay)

							//Add transaction to history
							this.data[this.state.selectedDay].history = this.data[this.state.selectedDay].history || {}
							this.data[this.state.selectedDay].history[this.state.catSelected] = this.data[this.state.selectedDay].history[this.state.catSelected] || []
							this.data[this.state.selectedDay].history[this.state.catSelected].push({ amount: parseInt(this.state.amount), date: Date.now() })

							this.markedDates = { ...this.markedDates, [this.state.selectedDay]: { ...this.markedDates[this.state.selectedDay], marked: true } }

							this.pushData(this.data)
							this.setState({ amount: "" })

							this.setModalVisible(!this.state.modalVisible)
						}} style={{
							color: "white",
							padding: 10
						}}
							color={getColor(this.state.catSelected)}
							title={translate("main_add_expense_button")} />
					</View>
				</Modal>
				{this._renderSummaryModal(this.currentMonth)}
				<ActionButton onPress={() => { this.setState({ showSummary: true }) }} renderIcon={(active) => {
					return <Icon color={'white'} size={15} name="chart-line" />
				}} offsetY={15} offsetX={120} spacing={15} verticalOrientation="down" position="right" spacing={15} fixNativeFeedbackRadius={true} position="right" backdrop={
					<View style={{ position: 'absolute', top: 0, left: 0, height: HEIGHT, width: WIDTH, backgroundColor: 'black', opacity: 1 }}></View>
				} size={40} buttonColor={SPENDLESS_LIGHT_BLUE}>
				</ActionButton>
				<ActionButton onPress={() => { console.log("CODE", this.code); this.props.navigation.navigate('ShoppingList', { shopping: this.shopping, code: this.code }) }} renderIcon={(active) => {
					return <Icon color={'white'} size={15} name="tasks" />
				}} offsetY={15} offsetX={70} spacing={15} verticalOrientation="down" position="right" spacing={15} fixNativeFeedbackRadius={true} position="right" size={40} buttonColor={SPENDLESS_LIGHT_BLUE}>
				</ActionButton>
				<ActionButton onPress={() => { console.log("CODE", this.code); this.props.navigation.navigate('Profile', { code: this.code }) }} renderIcon={(active) => {
					return <Icon color={'white'} size={15} name="user" />
				}} offsetY={15} offsetX={20} spacing={15} verticalOrientation="down" position="right" spacing={15} fixNativeFeedbackRadius={true} position="right" size={40} buttonColor={SPENDLESS_LIGHT_BLUE}>
				</ActionButton>
				{this._shouldRenderActionButton()}
			</View>
		)
	}
}

const AppNavigator = FluidNavigator(
	{
		Splash: { screen: Splash },
		Currency: { screen: Currency },
		Tutorial: { screen: Tutorial },
		Main: { screen: Main },
		History: { screen: History },
		ShoppingList: { screen: ShoppingList },
		Profile: { screen: Profile }
	},
	{
		initialRouteName: 'Splash'
	}
);

const RootStack = createStackNavigator(
	{
		AppNavigator: {
			screen: AppNavigator,
		},
		SignUpModal: {
			screen: SignUpModal,
		},
	},
	{
		mode: 'modal',
		headerMode: 'none',
	}
);

let AppContainer = createAppContainer(RootStack);

export default () => {

	return (
		<AppContainer onNavigationStateChange={(prevState, newState, action) => {
			{/* if (action.type === "Navigation/BACK" && newState.index === 0)
			BackHandler.exitApp() */}
		}} />
	)
}
