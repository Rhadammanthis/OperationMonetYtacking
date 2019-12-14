/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component, useState, useEffect } from 'react';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import {
	AsyncStorage,
	StyleSheet,
	Keyboard, TouchableNativeFeedback,
	View, Text,
	StatusBar, Image,
	Button, PanResponder,
	Dimensions, FlatList,
	TextInput, BackHandler,
	TouchableOpacity, Animated,
	Platform, LayoutAnimation
} from 'react-native';

import {
	Header,
	LearnMoreLinks,
	Colors,
	DebugInstructions,
	ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { createStackNavigator, createAppContainer } from "react-navigation";
// import ActionButton from 'react-native-circular-action-menu';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Modal from 'react-native-modalbox';
import firebase from 'firebase';
import { Transition, FluidNavigator } from 'react-navigation-fluid-transitions'
import { FlatGrid } from 'react-native-super-grid';
import * as Progress from 'react-native-progress';
import { PieChart } from 'react-native-svg-charts'
import * as Data from './data/data'
import { thisExpression } from '@babel/types';


/**
 * CATEGORIES
 * 	Vegetables = vgt = #238364
 * 	Fruits = fts = #A02C2D
 * 	Dairy = dry = #FED797
 * 	Meath/Fish = mef = 9E6B55
 * 	Sweets = swt = #CA7E8D
 * 	Cereals = crl = #AF6E4E
 * 	Cleaning = cln = #5E96AE
 * 	Others = oth = #909090
 */

var { height, width } = Dimensions.get('window');
console.log('Height', height)

const calendarDayTextSize = height < 600 ? 14 : 16
const calendarMonthTextSize = height < 600 ? 20 : 30
const panelOffset = (height * -0.27)

const CATEGORIES = {
	vgt: { COLOR: '#238364', ICON: "carrot", NAME: 'Vegetables' },
	fts: { COLOR: '#afc474', ICON: "apple-alt", NAME: 'Fruits' },
	dry: { COLOR: '#F99D33', ICON: "cheese", NAME: 'Dairy' },
	mef: { COLOR: '#AA3C3B', ICON: "drumstick-bite", NAME: 'Meet & Fish' },
	swt: { COLOR: '#CA7E8D', ICON: "ice-cream", NAME: 'Sweets' },
	crl: { COLOR: '#71503A', ICON: "bread-slice", NAME: 'Cereals' },
	cln: { COLOR: '#5E96AE', ICON: "toilet-paper", NAME: 'Hygene' },
	oth: { COLOR: '#909090', ICON: "cash-register", NAME: 'Other' },
}

const BLU = '#005577'
const BLU_LIGHT = 'rgba(0, 173, 245, 1)'
const BLU_LIGHT_ALPHA = 'rgba(0, 173, 245, 0.25)'

String.prototype.insert = function (idx, rem, str) {
	return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

const applyMoneyMask = (quantity) => {

	if (quantity === null || quantity === undefined)
		return

	let str = quantity.toString()
	let size = str.length;
	let d = Math.floor(size / 4)

	for (let i = 1; i <= d; i++) {
		str = str.insert(size - (i * 3), 0, ",")
	}

	return str
}

class Splash extends Component {
	constructor(props) {
		super(props)
		//161943 H&K
		this.state = { code: "", storedCode: "null", settings: {} }
	}

	_storeData = async (code) => {
		try {
			await AsyncStorage.setItem('@AccountCode:key24', code);
			console.log("Saved!")
		} catch (error) {
			// Error saving data
		}
	};

	_retrieveData = async () => {
		try {
			const code = await AsyncStorage.getItem('@AccountCode:key24');
			this.setState({ storedCode: code })
			console.log("Code", code)

			try {
				let snapshot = await firebase.database().ref(`/${code}/`).once('value');
				return snapshot.val();
			}
			catch (error) {
				return error
			}

		} catch (error) {
			return error
		}
	};

	_retrieveSettings = async () => {
		try {
			const value = await AsyncStorage.getItem('@AccountCode:settings3');
			console.log("Settings", value)

			if (value === null)
				return Promise.reject(new Error("No data"))

			this.setState({ settings: value })
			return value
		} catch (error) {
			// Error retrieving data
			return error
		}
	};

	componentDidMount() {

		const didBlurSubscription = this.props.navigation.addListener(
			'didFocus',
			payload => {
				console.log('didFocus', payload);
				const { action } = payload;

				if (action.type === "Navigation/COMPLETE_TRANSITION") {
					this._retrieveData()
						.then(value => {
							console.log("Retrieve data success", value)
							// this.props.navigation.navigate('Main', { moneyData: value, code: this.state.storedCode })

						})
						.catch(error => console.log("Retrieve data error", error))
				}
			}
		);

		this._retrieveSettings()
			.then((value) => this._retrieveData()
				.then(value => {
					console.log("Retrieve data success", value)
					this.props.navigation.navigate('Main', { moneyData: value, code: this.state.storedCode, currency: this.state.settings })
				})
				.catch(error => console.log("Retrieve data error", error)))
			.catch((error) => this.props.navigation.navigate('Currency'))

	}

	onSubmit = (code) => {
		this.setState({ storedCode: code })
		this._storeData(code)
			.then((velue) => this._retrieveData()
				.then(value => {
					console.log("Retrieve data success", value)
					this.props.navigation.navigate('Main', { moneyData: value, code: this.state.storedCode, currency: this.state.settings })
				})
			)
	}

	_renderForm = () => {

		if (!this.state.storedCode)
			return (
				<View style={{ flexDirection: 'row', marginTop: 20 }}>
					<View style={{ flex: 1 }} />
					<View style={{ flex: 3 }}>
						<TextInput onSubmitEditing={this.onSubmit.bind(this, this.state.code)} onChangeText={(text) => this.setState({ code: text })} style={{ backgroundColor: 'white', borderRadius: 10, marginVertical: 10 }} value={this.state.code} placeholder={'Account Code'}></TextInput>
						<Button onPress={this.onSubmit.bind(this, this.state.code)} style={{ marginHorizontal: 50 }} title={'Submit'} />
					</View>
					<View style={{ flex: 1 }} />
				</View>
			)

		return (
			<View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
				<Progress.Bar
					color={BLU_LIGHT}
					width={300}
					style={{ margin: 10 }}
					progress={0}
					indeterminate={true}
				/>
			</View>
		)

	}

	render() {
		return (
			<View style={{ flex: 1, justifyContent: 'center', backgroundColor: BLU }}>
				{/* <Text style={{ color: 'black', fontSize: 25, color:  'white' }}> LOADING...</Text> */}
				<View style={{ alignItems: 'center', justifyContent: 'center', }}>
					<View style={{ width: 160, height: 160, borderRadius: 40, borderColor: 'white', borderWidth: 7, alignItems: 'center', justifyContent: 'center' }}>
						<Icon size={80} color={'white'} name={'money-bill-alt'} />
					</View>
					<Text style={{ color: 'white', fontSize: 25, fontWeight: 'bold', fontFamily: 'Roboto', marginTop: 10 }}> Spendless</Text>
				</View>
				{this._renderForm()}
			</View>
		)
	}
}

class Currency extends Component {
	constructor(props) {
		super(props)
		//161943 H&K
		this.state = { selectedCountry: {}, animCloseButton: new Animated.Value(0) }
	}

	componentDidMount() {


	}

	Item = ({ country }) => {
		// console.log(country)

		const { selectedCountry } = this.state

		const springAnimation = Animated.spring(this.state.animCloseButton, {
			toValue: 1,
			duration: 200,
			friction: 8,
			tension: 50,
			useNativeDriver: true
		})

		const selected = { backgroundColor: BLU_LIGHT_ALPHA }

		return (
			<TouchableNativeFeedback onPress={(ev) => { this.setState({ selectedCountry: country }); springAnimation.start() }} style={{ position: 'absolute' }} >
				<View style={[{ paddingHorizontal: 10, paddingVertical: 15, flexDirection: 'row', width: width * 0.75 }, country.id === selectedCountry.id ? selected : {}]}>
					<Image style={{ width: 40, height: 40 }} source={country.image} />
					<View style={{ justifyContent: 'center', alignItems: 'center', marginHorizontal: 15 }}>
						<Text style={{ color: 'black', fontSize: 16, textAlign: 'center' }}>{country.name}</Text>
					</View>
					<View style={{ justifyContent: 'center', flex: 1, alignItems: 'flex-end' }}>
						<Text style={{ color: 'black', fontSize: 16, textAlign: 'center' }}>{country.currency}</Text>
					</View>
				</View>
			</TouchableNativeFeedback>
		)
	}

	_storeData = async (country) => {
		try {
			await AsyncStorage.setItem('@AccountCode:settings3', country.currency);
			return { success: true, value: country }
		} catch (error) {
			// Error saving data
			return { success: false, value: error }
		}
	};

	_renderAcceptButton = () => {
		const { animCloseButton, selectedCountry } = this.state

		return (
			<TouchableNativeFeedback onPress={(evnt) => {
				this._storeData(selectedCountry)
					.then((value) => { console.log(value); this.props.navigation.goBack() })
					.catch((error) => { console.log(error) })
			}}
				style={{ borderRadius: 20 }}>
				<Animated.View style={[{ alignItems: 'center', justifyContent: 'center', backgroundColor: BLU_LIGHT, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }, {
					transform: [{
						translateY: animCloseButton.interpolate({
							inputRange: [0, 1],
							outputRange: [300, 20]
						})
					}]
				}]}>
					<Text style={{ color: 'white' }}> SELECT </Text>
				</Animated.View>
			</TouchableNativeFeedback>
		)
	}

	render() {
		return (
			<View style={{ flex: 1, justifyContent: 'center', backgroundColor: BLU, alignItems: 'center' }}>
				<Text style={{ color: 'white', textAlign: 'center', fontSize: 25, maxWidth: width * 0.75, marginVertical: 25 }}>
					Select your prefered currency
				</Text>
				<View style={{ height: height * 0.5, backgroundColor: 'white', borderRadius: 10, marginBottom: 15 }}>
					<FlatList
						data={Data.countries}
						renderItem={({ item }) => { return (<this.Item country={item} />) }}
						keyExtractor={country => country.id}
						ItemSeparatorComponent={() => <View style={{ height: 0.4, backgroundColor: 'grey' }} />}
					/>
				</View>
				{this._renderAcceptButton()}
			</View>
		)
	}
}

class ListItem extends Component {
	constructor(props) {
		super(props)

		this._animated = new Animated.Value(0)
	}

	componentDidMount() {

		console.log("Component mounted: ", this.props.index)

		Animated.timing(this._animated, {
			toValue: 1,
			duration: (this.props.index + 1) * 50,
			clamp: 1000
		}).start()
	}

	render() {
		const { item, history, onUpdated, index, currency } = this.props

		const rowStyles = [
			{
				alignItems: 'center', backgroundColor: 'white', borderRadius: 5,
				backgroundColor: CATEGORIES[item.key].COLOR, padding: 5
			},
			{ opacity: this._animated },
			{
				transform: [
					{ scale: this._animated },
					{
						rotate: this._animated.interpolate({
							inputRange: [0, 1],
							outputRange: ['35deg', '0deg'],
							extrapolate: 'clamp',
						})
					}
				],
			},
		];
		return (
			<TouchableOpacity onPress={() => { this.props.onPress() }} onLongPress={(event) => {
				const { navigate } = this.props.navigation;
				navigate('History', { cat: item.key, history: history, amount: item.amount, onUpdated: onUpdated, currency: currency })
			}}>
				<Animated.View style={rowStyles}>
					<Transition shared={CATEGORIES[item.key].ICON}>
						<View style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'white', alignItems: 'center', justifyContent: 'center', backgroundColor: CATEGORIES[item.key].COLOR }}>
							<Icon size={28} color={'white'} name={CATEGORIES[item.key].ICON} />
						</View>
					</Transition>
					<Text style={{ fontSize: 16, marginTop: 5, color: 'white' }}>{applyMoneyMask(item.amount)} {currency}</Text>
				</Animated.View>
			</TouchableOpacity>
		)
	}
}

class Main extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedDay: null, modalVisible: false, catSelected: "vgt",
			amount: null, dayExpenses: [], refresh: false, renderTotal: false, anim: new Animated.Value(0),
			open: false, showSummary: false, lastDay: null, top: Math.floor(height / 2), selectedSlice: {
				label: 'vgt', value: 0
			}, labelWidth: 0
		};

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

			// try {
			// 	const value = AsyncStorage.getItem('@AccountCode:settings3');
			// 	console.log("Settings", value)
	
			// 	if (value === null)
			// 		return Promise.reject(new Error("No data"))
	
			// 	this.currency = value
			// } catch (error) {
			// 	// Error retrieving data
			// 	return error
			// }

		this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {

			if (this.props.navigation.isFocused()) {
				if (this.state.modalVisible) {
					this.setState({ modalVisible: false })
					return true
				}

				if (this.state.open) {
					this.expandPanel()
					return true
				}
			}

		});



		// this.setState({markedDates: this.markedDates})
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
					<View style={{ position: 'absolute', top: 0, left: 0, height: height, width: width, backgroundColor: 'black', opacity: 0.7 }}></View>
				} size={47} buttonColor="rgba(0, 173, 245, 1)">
					<ActionButton.Item textStyle={{ color: 'white' }}
						textContainerStyle={{ borderRadius: 5, backgroundColor: CATEGORIES.vgt.COLOR, borderColor: CATEGORIES.vgt.COLOR }}
						buttonColor={CATEGORIES.vgt.COLOR} title={CATEGORIES.vgt.NAME} onPress={this.categoryButtonPressed.bind(this, "vgt")}>
						<Icon size={20} name={CATEGORIES.vgt.ICON} color={'white'} />
					</ActionButton.Item>
					<ActionButton.Item textStyle={{ color: 'white' }}
						textContainerStyle={{ borderRadius: 5, backgroundColor: CATEGORIES.fts.COLOR, borderColor: CATEGORIES.fts.COLOR }}
						buttonColor={CATEGORIES.fts.COLOR} title={CATEGORIES.fts.NAME} onPress={this.categoryButtonPressed.bind(this, "fts")}>
						<Icon size={20} name={CATEGORIES.fts.ICON} color={'white'} />
					</ActionButton.Item>
					<ActionButton.Item textStyle={{ color: 'white' }}
						textContainerStyle={{ borderRadius: 5, backgroundColor: CATEGORIES.dry.COLOR, borderColor: CATEGORIES.dry.COLOR }}
						buttonColor={CATEGORIES.dry.COLOR} title={CATEGORIES.dry.NAME} onPress={this.categoryButtonPressed.bind(this, "dry")}>
						<Icon size={20} name={CATEGORIES.dry.ICON} color={'white'} />
					</ActionButton.Item>
					<ActionButton.Item textStyle={{ color: 'white' }}
						textContainerStyle={{ borderRadius: 5, backgroundColor: CATEGORIES.mef.COLOR, borderColor: CATEGORIES.mef.COLOR }}
						buttonColor={CATEGORIES.mef.COLOR} title={CATEGORIES.mef.NAME} onPress={this.categoryButtonPressed.bind(this, "mef")}>
						<Icon size={20} name={CATEGORIES.mef.ICON} color={'white'} />
					</ActionButton.Item>
					<ActionButton.Item textStyle={{ color: 'white' }}
						textContainerStyle={{ borderRadius: 5, backgroundColor: CATEGORIES.swt.COLOR, borderColor: CATEGORIES.swt.COLOR }}
						buttonColor={CATEGORIES.swt.COLOR} title={CATEGORIES.swt.NAME} onPress={this.categoryButtonPressed.bind(this, "swt")}>
						<Icon size={20} name={CATEGORIES.swt.ICON} color={'white'} />
					</ActionButton.Item>
					<ActionButton.Item textStyle={{ color: 'white' }}
						textContainerStyle={{ borderRadius: 5, backgroundColor: CATEGORIES.crl.COLOR, borderColor: CATEGORIES.crl.COLOR }}
						buttonColor={CATEGORIES.crl.COLOR} title={CATEGORIES.crl.NAME} onPress={this.categoryButtonPressed.bind(this, "crl")}>
						<Icon size={20} name={CATEGORIES.crl.ICON} color={'white'} />
					</ActionButton.Item>
					<ActionButton.Item textStyle={{ color: 'white' }}
						textContainerStyle={{ borderRadius: 5, backgroundColor: CATEGORIES.cln.COLOR, borderColor: CATEGORIES.cln.COLOR }}
						buttonColor={CATEGORIES.cln.COLOR} title={CATEGORIES.cln.NAME} onPress={this.categoryButtonPressed.bind(this, "cln")}>
						<Icon size={20} name={CATEGORIES.cln.ICON} color={'white'} />
					</ActionButton.Item>
					<ActionButton.Item textStyle={{ color: 'white' }}
						textContainerStyle={{ borderRadius: 5, backgroundColor: CATEGORIES.oth.COLOR, borderColor: CATEGORIES.oth.COLOR }}
						buttonColor={CATEGORIES.oth.COLOR} title={CATEGORIES.oth.NAME} onPress={this.categoryButtonPressed.bind(this, "oth")}>
						<Icon size={20} name={CATEGORIES.oth.ICON} color={'white'} />
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

		//To prevent excessive state updates
		if (this.state.selectedSlice.value === 0)
			this.setState({ selectedSlice: { value: applyMoneyMask(totals.vgt), label: 'vgt' } })

		const { labelWidth, selectedSlice } = this.state;
		const { label, value } = selectedSlice;

		const data = Object.keys(totals).map((key, index) => {
			total += totals[key]
			return {
				key,
				value: totals[key],
				svg: { fill: CATEGORIES[key].COLOR },
				arc: { outerRadius: '90%', padAngle: label === key ? 0.05 : 0 },
				onPress: () => {
					LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
					this.setState({ selectedSlice: { label: key, value: applyMoneyMask(totals[key]) } })
				}
			}
		})

		return (
			<Modal style={{
				height: height * 0.6,
				width: 350,
				borderRadius: 10,
			}} onClosed={() => { this.setState({ showSummary: false }) }} position={"center"} ref={"modal3"} isOpen={this.state.showSummary}
				animationDuration={350} swipeToClose={false}>
				<Text style={{ textAlign: 'left', paddingLeft: 10, fontSize: 20, color: 'black', paddingVertical: 10 }}>
					Month's Summary
				</Text>
				<View style={{ justifyContent: 'center', flex: 1 }}>
					<PieChart
						style={{ height: height * 0.45 }}
						outerRadius={'85%'}
						innerRadius={'55%'}
						data={data}
					/>
					<View style={{
						left: (350 / 2 - (width * 0.150)), position: 'absolute', width: width * 0.3, height: width * 0.3,
						borderRadius: width * 0.150, borderWidth: 3, borderColor: CATEGORIES[label].COLOR, backgroundColor: 'white',
						padding: 5, alignItems: 'center', justifyContent: 'center'
					}}>
						<Icon style={{ marginVertical: 5 }} size={30} color={CATEGORIES[label].COLOR} name={CATEGORIES[label].ICON} />
						<Text style={{ color: CATEGORIES[label].COLOR, marginTop: 5 }}>{CATEGORIES[label].NAME}</Text>
						<Text style={{ color: CATEGORIES[label].COLOR }}>{value} {this.currency}</Text>
					</View>
				</View>
				<Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 17, color: 'white', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: BLU, justifyContent: 'center', alignItems: 'center', paddingVertical: 10 }}>
					Total: {applyMoneyMask(total)} {this.currency}
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

	getCategoryColor(category) {
		return CATEGORIES[category].COLOR
	}

	getCategoryIcon(category) {
		return CATEGORIES[category].ICON
	}

	_renderDayTotal = () => {
		if (this.state.dayExpenses.length > 0) {

			let dailyExpensesSum = 0

			for (let index = 0; index < this.state.dayExpenses.length; index++) {
				dailyExpensesSum += this.state.dayExpenses[index].amount
			}

			return (
				<Text style={{ color: 'white', fontWeight: 'bold', fontSize: 17 }}> Day Total: {applyMoneyMask(dailyExpensesSum)} {this.currency}</Text>
			)
		}

		return null
	}

	pushData = async (data) => {
		let snapshot = await firebase.database().ref(`/${this.props.navigation.getParam('code', null)}/`).update(data)
	}

	expandPanel = () => {
		Animated.spring(this.animatedOffset, {
			toValue: this.state.open ? 0 : panelOffset,
			duration: 200,
			friction: 6,
			useNativeDriver: true
		}).start((result) => {
			this.setState({ open: !this.state.open })
		});
	}

	updateCurrentMonth = (date) => {
		this.currentMonth = date.dateString.substring(0, 7)
	}

	render() {
		return (
			<View style={{ flexDirection: 'column', flex: 1, backgroundColor: BLU }}>
				<StatusBar barStyle={this.statusBarTheme} />
				<CalendarList
					theme={{
						calendarBackground: BLU,
						dayTextColor: 'white',
						monthTextColor: 'white',
						textDayFontSize: calendarDayTextSize,
						textMonthFontSize: calendarMonthTextSize,
						textDayHeaderFontSize: calendarDayTextSize
					}}
					onVisibleMonthsChange={(months) => { this.updateCurrentMonth(months[0]) }}
					horizontal={true}
					pagingEnabled={true}
					calendarWidth={width}
					calendarHeight={height * 0.525}
					onMonthChange={(date) => { this.updateCurrentMonth(date) }}
					monthFormat={'MMMM'}
					onDayPress={(day) => { this._ondDayPressed(day.dateString) }}
					markedDates={this.markedDates}
				/>

				<Draggable style={{
					height: height * 0.73, flexDirection: 'column', backgroundColor: '#EEE', borderTopRightRadius: 15, borderTopLeftRadius: 15
				}}>
					<FlatGrid
						style={{ flex: 1 }}
						itemDimension={(width - 50) / 3}
						items={this.state.dayExpenses}
						renderItem={({ item, index }) => (
							<ListItem item={item} index={index}
								onPress={() => { this.categoryButtonPressed(item.key) }}
								navigation={this.props.navigation}
								currency={this.currency}
								history={this.data[this.state.selectedDay].history[item.key]}
								onUpdated={this.onUpdated} />)
						} />
					<View style={{ backgroundColor: '#005577', width: width, alignItems: 'center', justifyContent: 'center', height: 70 }}>
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
					<View style={{ height: 170, width: 100, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 10, borderBottomLeftRadius: 10, backgroundColor: this.getCategoryColor(this.state.catSelected) }}>
						<Icon size={70} color={"white"} name={this.getCategoryIcon(this.state.catSelected)} />
					</View>
					<View style={{ flex: 1, padding: 10 }}>
						<Text style={{ fontSize: 20 }}> Add Expense </Text>
						<Text style={{ fontSize: 15, marginTop: 5 }}> How much did you spend? </Text>
						<View style={{ alignItems: 'center', flexDirection: 'row' }}>
							<TextInput onSubmitEditing={Keyboard.dismiss} placeholder={"Amount"} value={this.state.amount} onChangeText={(text) => this.setState({ amount: text })} keyboardType={'numeric'} style={{ flex: 1, marginVertical: 0, borderBottomWidth: 2, borderColor: this.getCategoryColor(this.state.catSelected) }} />
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
							color={this.getCategoryColor(this.state.catSelected)}
							title="Add" />
					</View>
				</Modal>
				{this._renderSummaryModal(this.currentMonth)}
				<ActionButton onPress={() => { this.setState({ showSummary: true }) }} renderIcon={(active) => {
					return <Icon color={'white'} size={15} name="chart-line" />
				}} offsetY={15} offsetX={20} spacing={15} verticalOrientation="down" position="right" spacing={15} fixNativeFeedbackRadius={true} position="right" backdrop={
					<View style={{ position: 'absolute', top: 0, left: 0, height: height, width: width, backgroundColor: 'black', opacity: 1 }}></View>
				} size={40} buttonColor={BLU_LIGHT}>
				</ActionButton>
				<ActionButton onPress={() => { this.props.navigation.navigate('ShoppingList', { shopping: this.shopping, code: this.code }) }} renderIcon={(active) => {
					return <Icon color={'white'} size={15} name="tasks" />
				}} offsetY={15} offsetX={70} spacing={15} verticalOrientation="down" position="right" spacing={15} fixNativeFeedbackRadius={true} position="right" size={40} buttonColor={BLU_LIGHT}>
				</ActionButton>
				{this._shouldRenderActionButton()}
			</View >
		)
	}

}

class History extends Component {
	constructor(props) {
		super(props)

		const { navigation } = this.props;
		this.cat = CATEGORIES[navigation.getParam('cat', null)].COLOR;
		this.icon = CATEGORIES[navigation.getParam('cat', null)].ICON;
		this.title = CATEGORIES[navigation.getParam('cat', null)].NAME;

		this.history = navigation.getParam('history', null)
		this.amount = this.props.navigation.getParam('amount', null)
		this.currency = this.props.navigation.getParam('currency', null)

		this._animated = new Animated.Value(0)

		todaysDate = new Date(this.history[0].date).toLocaleDateString()

		state = { history: this.history }
		console.log(this.history)
	}

	componentDidMount() {
		StatusBar.setBackgroundColor(this.cat, true)

		BackHandler.addEventListener('hardwareBackPress', () => {
			StatusBar.setBackgroundColor(BLU, true)
		})

	}

	_renderHistory = () => {
		if (this.history.length === 0) {
			StatusBar.setBackgroundColor(BLU, true)
			return this.props.navigation.goBack();
		}

		let items = this.history.map((item, i) => {
			return (
				<TouchableOpacity key={i} onPress={(event) => {
					this.amount -= item.amount
					this.history.splice(i, 1)
					this.setState({ history: this.history })

					this.props.navigation.state.params.onUpdated(this.props.navigation.getParam('cat', null),
						this.amount);
				}}>
					<View style={{ flexDirection: 'row', marginHorizontal: 10, backgroundColor: "" }}>
						<Text style={{ fontSize: 20, color: 'black' }}>{applyMoneyMask(item.amount)} {this.currency}</Text>
						<View style={{ flex: 1 }} />
						<Text style={{ fontSize: 15 }}>{new Date(item.date).toLocaleTimeString()}</Text>
					</View>
				</TouchableOpacity>
			)
		})

		return items
	}

	render() {
		return (
			<View style={{ flex: 1, flexDirection: 'column', backgroundColor: this.cat }}>
				<View style={{ flexDirection: 'row', padding: 20 }}>
					<Transition shared={this.icon}>
						<Animated.View style={[{ width: 60, height: 60, borderRadius: 35, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', backgroundColor: this.cat }]}>
							<Icon size={35} color={'white'} name={this.icon} />
						</Animated.View>
					</Transition>
					<View style={{ flex: 1, justifyContent: 'flex-start', marginLeft: 20 }}>
						<Text style={{ color: 'white', fontSize: 30 }}>{this.title}</Text>
						<Text style={{ color: 'white', fontSize: 20, marginTop: 20 }}>{todaysDate}</Text>
					</View>
				</View>

				<View style={{ marginHorizontal: 10, marginBottom: 10, flex: 1, borderRadius: 20, backgroundColor: 'white' }}>
					<View style={{ flexDirection: 'row', margin: 10 }}>
						<Text style={{ fontSize: 25, color: 'black' }}>Amount</Text>
						<View style={{ flex: 1 }} />
						<Text style={{ fontSize: 25 }}>Time</Text>
					</View>
					{this._renderHistory()}
				</View>
			</View>
		)
	}
}

class ShoppingList extends Component {
	constructor(props) {
		super(props)
		this.state = { refresh: false, extraItemText: "" }

		this.code = this.props.navigation.getParam('code', null)
		console.log("Shopping", this.code)
	}

	componentDidMount() {

		this.fetchData().then((shoppingList) => { this.shoppingList = shoppingList; this.forceUpdate(); }).catch((error) => console.log("error", error))


	}

	pushData = async (ref, value) => {
		console.log(ref)
		let snapshot = await firebase.database().ref(ref).set(value)
	}

	updateData = async (ref, value) => {
		console.log(ref)
		let snapshot = await firebase.database().ref(ref).update(value)
	}

	fetchData = async () => {
		try {
			let snapshot = await firebase.database().ref(`/${this.code}/shopping`).once('value');
			return snapshot.val();
		}
		catch (error) {
			return error
		}
	}

	checkbox = ({ state, title, index }) => {

		const [active, setActive] = useState(state);
		const [animated, setAnimated] = useState(new Animated.Value(0));

		useEffect(() => {
			//To account for a bug that would persist the state of the checkbox even after deletion
			setActive(this.shoppingList[index].active)
		});

		let interpolatedValue = animated.interpolate({
			inputRange: [0, 1],
			outputRange: [40, -20]
		})

		let animation = Animated.spring(animated, {
			toValue: 1,
			duration: 200,
			friction: 8,
			tension: 50,
			useNativeDriver: true
		})

		let reverseAnimation = Animated.spring(animated, {
			toValue: 0,
			duration: 200,
			friction: 8,
			tension: 50,
			useNativeDriver: true
		})

		return (
			<View style={{ flexDirection: 'row' }}>
				<View key={index} style={{ flexDirection: 'row', marginHorizontal: 20, flex: 1, alignItems: 'center' }}>
					<TouchableNativeFeedback onPress={(event) => {
						setActive(!active);
						this.shoppingList[index].active = !active;

						this.updateData(`/${this.code}/shopping/${index}/`, { active: !active })
					}}>
						<View style={{ height: 30, width: 30, borderWidth: 1, borderColor: BLU_LIGHT, borderRadius: 20, backgroundColor: active ? BLU_LIGHT : BLU }}></View>
					</TouchableNativeFeedback>
					<TouchableNativeFeedback onPress={() => { animation.start(); setTimeout(() => { reverseAnimation.start() }, 3000) }}>
						<Text style={{ flex: 1, color: 'white', textAlign: 'left', fontSize: 20, marginHorizontal: 20 }}> {title} </Text>
					</TouchableNativeFeedback>
				</View>
				<Animated.View style={{ transform: [{ translateX: interpolatedValue }], alignItems: 'center', justifyContent: 'center', height: 30, width: 30, borderRadius: 15, backgroundColor: '#AA3C3B' }}>
					<TouchableNativeFeedback onPress={() => {
						console.log(`${index} should be deleted`); this.shoppingList.splice(index, 1);
						this.setState({ refresh: !this.state.refresh });

						this.pushData(`/${this.code}/shopping/`, this.shoppingList)
					}}>
						<Icon color={'white'} size={20} name="times-circle" />
					</TouchableNativeFeedback>
				</Animated.View>
			</View>
		)
	}

	_renderShoppingList = (shoppingList) => {
		if (shoppingList === null)
			return null


		return (
			<FlatList
				data={shoppingList}
				extraData={this.shoppingList}
				renderItem={({ item, index, separators }) => { return (<this.checkbox index={index} title={item.title} state={item.active} />) }}
				ItemSeparatorComponent={() => <View style={{ height: 0.4, marginVertical: 5 }} />}
			/>
		)
	}

	render() {
		return (
			<View style={{ flex: 1, flexDirection: 'column', backgroundColor: BLU }}>
				<Text style={{ color: 'white', fontSize: 45, margin: 20 }}>Shopping List</Text>
				{this._renderShoppingList(this.shoppingList)}
				<View style={{ flex: 1 }} />
				<View style={{ flexDirection: 'row', margin: 10, justifyContent: 'space-between' }}>
					<TextInput style={{ flex: 1, backgroundColor: 'white', borderRadius: 10 }} placeholder={"New Item"} value={this.state.extraItemText} onChangeText={(text) => this.setState({ extraItemText: text })} />
					<ActionButton onPress={() => {
						if (this.state.extraItemText.length === 0) return;
						this.shoppingList = this.shoppingList || []
						this.shoppingList.push({ title: this.state.extraItemText, active: false });
						this.setState({ refresh: !this.state.refresh, extraItemText: "" });
						this.pushData(`/${this.code}/shopping/`, this.shoppingList)
						console.log(this.shoppingList)
					}}
						renderIcon={(active) => {
							return <Icon color={'white'} size={15} name="plus" />
						}}
						spacing={15} offsetX={10} offsetY={5} fixNativeFeedbackRadius={true} size={40} buttonColor={BLU_LIGHT}>
					</ActionButton>
				</View>
				<ActionButton onPress={() => {
					this.shoppingList = []
					this.setState({ refresh: !this.state.refresh });
					this.pushData(`/${this.code}/shopping/`, this.shoppingList)
				}}
					renderIcon={(active) => {
						return <Icon color={'white'} size={20} name="trash-alt" />
					}}
					verticalOrientation="down" position="right" spacing={15} offsetX={20} offsetY={30} fixNativeFeedbackRadius={true} size={45} buttonColor={'#AA3C3B'}>
				</ActionButton>
			</View>
		)
	}
}

class Draggable extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = { dragDelta: new Animated.Value(0), open: false }

	}

	componentWillMount() {

		this._val = 0
		this.state.dragDelta.addListener((value) => { this._val = value.value });

		this.panResponder = PanResponder.create({
			onStartShouldSetPanResponder: (e, gesture) => true,
			onPanResponderGrant: (e, gestureState) => {
				this.state.dragDelta.setOffset(this._val)
				this.state.dragDelta.setValue(0)
			},
			onPanResponderMove: Animated.event([
				null, { dy: this.state.dragDelta }])
		})
	}

	render() {

		const { style } = this.props
		this.clampedValue = Animated.diffClamp(this.state.dragDelta, panelOffset, 0)

		return (
			<Animated.View {...this.panResponder.panHandlers} style={[style, { transform: [{ translateY: this.clampedValue }] }]}>
				<View style={{ marginVertical: 5, alignItems: 'center', justifyContent: 'center' }}>
					<Icon size={20} name={'grip-lines'} color={'grey'} />
				</View>
				{this.props.children}
			</Animated.View>
		)
	}
}


const styles = StyleSheet.create({
	scrollView: {
		backgroundColor: Colors.lighter,
	},
	engine: {
		position: 'absolute',
		right: 0,
	},
	body: {
		backgroundColor: Colors.white,
	},
	sectionContainer: {
		marginTop: 32,
		paddingHorizontal: 24,
	},
	sectionTitle: {
		fontSize: 24,
		fontWeight: '600',
		color: Colors.black,
	},
	sectionDescription: {
		marginTop: 8,
		fontSize: 18,
		fontWeight: '400',
		color: Colors.dark,
	},
	highlight: {
		fontWeight: '700',
	},
	footer: {
		color: Colors.dark,
		fontSize: 12,
		fontWeight: '600',
		padding: 4,
		paddingRight: 12,
		textAlign: 'right',
	},
	actionButtonIcon: {
		color: 'white'
	}
});

const AppNavigator = FluidNavigator(
	{
		Splash: { screen: Splash },
		Currency: { screen: Currency },
		Main: { screen: Main },
		History: { screen: History },
		ShoppingList: { screen: ShoppingList }
	}, {
	initialRouteName: 'Splash'
}
);

let AppContainer = createAppContainer(AppNavigator);

export default () => (
	<AppContainer onNavigationStateChange={(prevState, newState, action) => {
		{/* if (action.type === "Navigation/BACK" && newState.index === 0)
			BackHandler.exitApp() */}
	}} />
)
