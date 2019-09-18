/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import {
	AsyncStorage,
	StyleSheet,
	Keyboard,
	View,
	Text,
	StatusBar,
	Button, PanResponder,
	Dimensions, ScrollView,
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

let moneyData = null

class Splash extends Component {
	constructor(props) {
		super(props)

		this.state = { code: "161943", storedCode: "null" }
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
			const value = await AsyncStorage.getItem('@AccountCode:key24');
			this.setState({ storedCode: value })
			console.log(value)
			return value
		} catch (error) {
			// Error retrieving data
		}
	};

	fetchData = async (code) => {
		let snapshot = await firebase.database().ref(`/${code}/`)
			.once('value');

		const { navigate } = this.props.navigation;
		console.log("Ready to continue with data", snapshot.val())
		navigate('Main', { moneyData: snapshot.val(), code: code })
	}

	componentDidMount() {

		this._retrieveData().then((code) => {
			if (code === null)
				return

			console.log(code)
			this.fetchData(code)
		})

	}

	onSubmit = (code) => {
		this.setState({ storedCode: code })
		this._storeData(code)
		this.fetchData(code)
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
					<Text style={{ color: 'white', fontSize: 25, fontWeight: 'bold', fontFamily: 'Roboto', marginTop: 10 }}> Operation Money Saving</Text>
				</View>
				{this._renderForm()}
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
		const { item, history, onUpdated, index } = this.props

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
				navigate('History', { cat: item.key, history: history, amount: item.amount, onUpdated: onUpdated })
			}}>
				<Animated.View style={rowStyles}>
					<Transition shared={CATEGORIES[item.key].ICON}>
						<View style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'white', alignItems: 'center', justifyContent: 'center', backgroundColor: CATEGORIES[item.key].COLOR }}>
							<Icon size={28} color={'white'} name={CATEGORIES[item.key].ICON} />
						</View>
					</Transition>
					<Text style={{ fontSize: 16, marginTop: 5, color: 'white' }}>{item.amount} ISK</Text>
				</Animated.View>
			</TouchableOpacity>
		)
	}
}

class Main extends Component {
	constructor(props) {
		super(props);
		// Don't call this.setState() here!
		this.state = { selectedDay: null, modalVisible: false, catSelected: "vgt", 
			amount: null, dayExpenses: [], refresh: false, renderTotal: false, 
			open: false, showSummary: false, lastDay: null};

		this.currentMonth = new Date().toISOString().substring(0, 7)
		this.markedDates = {
			
		}

		const { navigation } = this.props;
		this.data = navigation.getParam('moneyData', null);

		console.log("Data", this.data)

		this.dataSet = null

		this.statusBarTheme = Platform.OS === 'android' ? 'light-content' : 'dark-content'

		StatusBar.setBackgroundColor("#005577", true)

		this.anim = new Animated.Value(0)

		Object.keys(this.data).map((day, i) => {
			this.markedDates[day] = {marked: true} 
		})
	}

	componentDidMount() {
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

		// LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
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

		// this.markedDates[dateString] = {selected: true}

		console.log("MARKED",this.state)

		this.markedDates = {...this.markedDates, [dateString] : {...this.markedDates[dateString], selected: true, disableTouchEvent: false }}
		
		if(this.state.selectedDay !== null)
			this.markedDates = {...this.markedDates, [this.state.selectedDay] : { ...this.markedDates[this.state.selectedDay], selected: false, disableTouchEvent: false}}

		this.setState({ selectedDay: dateString})
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
		if (amount <= 0){
			delete this.data[this.state.selectedDay].expenses[cat]
			this.markedDates= {...this.markedDates, [this.state.selectedDay] : { ...this.markedDates[this.state.selectedDay], marked: false}} 
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

		let items = Object.keys(totals).map((category, i) => {
			total += totals[category]
			return (
				<View key={i} style={{ flexDirection: 'row', alignItems:'center', justifyContent: 'space-between', padding: 10 }}>
					{/* <Text style={{ color: 'white', fontSize: calendarDayTextSize }}>{CATEGORIES[category].NAME}</Text> */}
					<View style={{ height:50, width:50, borderRadius: 25, backgroundColor: CATEGORIES[category].COLOR, alignItems:'center', justifyContent: 'center'}}>
						<Icon size={20} name={CATEGORIES[category].ICON} color={'white'} />
					</View>
					<Text style={{ color: 'black', fontSize: 18 }}>{totals[category]} ISK</Text>
				</View>
			)
		})

		return (
			<Modal style={{
				height: height * 0.5,
				width: 350,
				borderRadius: 10,
			}} onClosed={() => { this.setState({ showSummary: false }) }} position={"center"} ref={"modal3"} isOpen={this.state.showSummary}
				animationDuration={350}  swipeToClose={false}>
				<View style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: BLU, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' }}>
					<Text style={{ color: 'white', fontSize: calendarDayTextSize }}> Month's Summary</Text>
				</View>
				<ScrollView style={{flex: 1, flexDirection: 'column', padding: 5}}>
					{items}
				</ScrollView>
				<View style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: BLU, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 10 }}>
					<Text style={{ color: 'white', fontSize: 16 }}>Total</Text>
					<Text style={{ color: 'white', fontSize: 16 }}>{total} ISK</Text>
				</View>
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
		// console.log("Category", category)
		// console.log("Object", CATEGORIES[category])
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
				<Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15, marginBottom: 20 }}> Day Total: {dailyExpensesSum} ISK</Text>
			)
		}

		return null
	}

	pushData = async (data) => {
		let snapshot = await firebase.database().ref(`/${this.props.navigation.getParam('code', null)}/`).update(data)
	}

	expandPanel = () => {
		Animated.spring(this.anim, {
			toValue: this.state.open ? 0 : 1,
			duration: 200,
			friction: 6,
			useNativeDriver: true
		}).start((result) => {
			this.setState({ open: !this.state.open })
		});
	}

	updateCurrentMonth=(date) => {
		console.log("NEW MONTH",date)
		this.currentMonth = date.dateString.substring(0,7)
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
					onMonthChange={(date) => { this.updateCurrentMonth(date)}}
					monthFormat={'MMMM'}
					onDayPress={(day) => { this._ondDayPressed(day.dateString) }}
					markedDates={this.markedDates}
					// markedDates={{
					// 	[this.state.selectedDay]: { selected: true, disableTouchEvent: true },
					// 	'2019-09-17': {marked: true},
					// }}
				/>
				{/* <View style={{ backgroundColor: '#005577', width: width, padding: 5, alignItems: 'center', justifyContent: 'center' }}>
					{this._renderDayTotal()}
				</View> */}
				<GestureRecognizer style={[{
					transform: [{
						translateY: this.anim.interpolate({
							inputRange: [0, 1],
							outputRange: [0, (-height * 0.25)]
						})
					}]
				}, { height: height * 0.75, flexDirection: 'column', backgroundColor: '#EEEEEE', borderTopRightRadius: 10, borderTopLeftRadius: 10 }]} config={{
					velocityThreshold: 0.3,
					directionalOffsetThreshold: 80
				}} onSwipeUp={(state) => { if (!this.state.open) this.expandPanel() }}
					onSwipeDown={(state) => { if (this.state.open) this.expandPanel() }}>
					<View style={{ marginTop: 5, alignItems: 'center', justifyContent: 'center' }}>
						<TouchableOpacity onPress={() => {
							this.expandPanel()
						}}>
							<Icon size={20} name={'grip-lines'} color={'grey'} />
						</TouchableOpacity>
					</View>
					<FlatGrid
						style={{ flex: 1 }}
						itemDimension={(width - 50) / 3}
						items={this.state.dayExpenses}
						renderItem={({ item, index }) => (
							<ListItem item={item} index={index}
								onPress={() => { this.categoryButtonPressed(item.key) }}
								navigation={this.props.navigation}
								history={this.data[this.state.selectedDay].history[item.key]}
								onUpdated={this.onUpdated} />)
						} />
					<View style={{ marginBottom: 20, backgroundColor: '#005577', width: width, alignItems: 'center', justifyContent: 'center', height: 70 }}>
						{this._renderDayTotal()}
					</View>
				</GestureRecognizer>
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
							<Text> ISK </Text>
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

							this.markedDates= {...this.markedDates, [this.state.selectedDay] : { ...this.markedDates[this.state.selectedDay], marked: true}} 

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
				{this._shouldRenderActionButton()}
			</View >
		);
	}

};

class History extends Component {
	constructor(props) {
		super(props)
		console.log("CONSTRUCTED")
		const { navigation } = this.props;
		this.cat = CATEGORIES[navigation.getParam('cat', null)].COLOR;
		this.icon = CATEGORIES[navigation.getParam('cat', null)].ICON;
		this.title = CATEGORIES[navigation.getParam('cat', null)].NAME;

		this.history = navigation.getParam('history', null)
		this.amount = this.props.navigation.getParam('amount', null)

		this._animated = new Animated.Value(0)

		todaysDate = new Date(this.history[0].date).toLocaleDateString()

		state = { history: this.history }
		console.log(this.history)
	}

	componentDidMount() {
		console.log("MOUNTED")

		StatusBar.setBackgroundColor(this.cat, true)

		BackHandler.addEventListener('hardwareBackPress', () => {
			StatusBar.setBackgroundColor(BLU, true)
		})

	}

	_renderHistory = () => {
		console.log("About to render", this.history)

		if (this.history.length === 0){
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
						<Text style={{ fontSize: 20, color: 'black' }}>{item.amount} ISK</Text>
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
							<Icon size={34} color={'white'} name={this.icon} />
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

const swipeDirections = {
	SWIPE_UP: 'SWIPE_UP',
	SWIPE_DOWN: 'SWIPE_DOWN',
	SWIPE_LEFT: 'SWIPE_LEFT',
	SWIPE_RIGHT: 'SWIPE_RIGHT'
};

const swipeConfig = {
	velocityThreshold: 0.1,
	directionalOffsetThreshold: 80,
	gestureIsClickThreshold: 5
};

function isValidSwipe(velocity, velocityThreshold, directionalOffset, directionalOffsetThreshold) {
	return Math.abs(velocity) > velocityThreshold && Math.abs(directionalOffset) < directionalOffsetThreshold;
}

class GestureRecognizer extends Component {

	constructor(props, context) {
		super(props, context);
		this.swipeConfig = Object.assign(swipeConfig, props.config);
	}

	componentWillReceiveProps(props) {
		this.swipeConfig = Object.assign(swipeConfig, props.config);
	}

	componentWillMount() {
		const responderEnd = this._handlePanResponderEnd.bind(this);
		const shouldSetResponder = this._handleShouldSetPanResponder.bind(this);
		this._panResponder = PanResponder.create({ //stop JS beautify collapse
			onStartShouldSetPanResponder: shouldSetResponder,
			onMoveShouldSetPanResponder: shouldSetResponder,
			onPanResponderRelease: responderEnd,
			onPanResponderTerminate: responderEnd
		});
	}

	_handleShouldSetPanResponder(evt, gestureState) {
		return evt.nativeEvent.touches.length === 1 && !this._gestureIsClick(gestureState);
	}

	_gestureIsClick(gestureState) {
		return Math.abs(gestureState.dx) < swipeConfig.gestureIsClickThreshold
			&& Math.abs(gestureState.dy) < swipeConfig.gestureIsClickThreshold;
	}

	_handlePanResponderEnd(evt, gestureState) {
		const swipeDirection = this._getSwipeDirection(gestureState);
		this._triggerSwipeHandlers(swipeDirection, gestureState);
	}

	_triggerSwipeHandlers(swipeDirection, gestureState) {
		const { onSwipe, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight } = this.props;
		const { SWIPE_LEFT, SWIPE_RIGHT, SWIPE_UP, SWIPE_DOWN } = swipeDirections;
		onSwipe && onSwipe(swipeDirection, gestureState);
		switch (swipeDirection) {
			case SWIPE_LEFT:
				onSwipeLeft && onSwipeLeft(gestureState);
				break;
			case SWIPE_RIGHT:
				onSwipeRight && onSwipeRight(gestureState);
				break;
			case SWIPE_UP:
				onSwipeUp && onSwipeUp(gestureState);
				break;
			case SWIPE_DOWN:
				onSwipeDown && onSwipeDown(gestureState);
				break;
		}
	}

	_getSwipeDirection(gestureState) {
		const { SWIPE_LEFT, SWIPE_RIGHT, SWIPE_UP, SWIPE_DOWN } = swipeDirections;
		const { dx, dy } = gestureState;
		if (this._isValidHorizontalSwipe(gestureState)) {
			return (dx > 0)
				? SWIPE_RIGHT
				: SWIPE_LEFT;
		} else if (this._isValidVerticalSwipe(gestureState)) {
			return (dy > 0)
				? SWIPE_DOWN
				: SWIPE_UP;
		}
		return null;
	}

	_isValidHorizontalSwipe(gestureState) {
		const { vx, dy } = gestureState;
		const { velocityThreshold, directionalOffsetThreshold } = this.swipeConfig;
		return isValidSwipe(vx, velocityThreshold, dy, directionalOffsetThreshold);
	}

	_isValidVerticalSwipe(gestureState) {
		const { vy, dx } = gestureState;
		const { velocityThreshold, directionalOffsetThreshold } = this.swipeConfig;
		return isValidSwipe(vy, velocityThreshold, dx, directionalOffsetThreshold);
	}

	render() {
		return (<Animated.View {...this.props} {...this._panResponder.panHandlers} />);
	}
};


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
		Main: { screen: Main },
		History: { screen: History }
	}, {
		initialRouteName: 'Splash'
	}
);

let AppContainer = createAppContainer(AppNavigator);

export default () => (
	<AppContainer onNavigationStateChange={(prevState, newState, action) => {
		if (action.type === "Navigation/BACK" && newState.index === 0)
			BackHandler.exitApp()
	}} />
)
