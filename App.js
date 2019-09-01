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
	SafeAreaView,
	StyleSheet,
	FlatList,
	View,
	Text,
	StatusBar,
	Button,
	Dimensions,
	TextInput,
	TouchableOpacity
} from 'react-native';

import {
	Header,
	LearnMoreLinks,
	Colors,
	DebugInstructions,
	ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { createStackNavigator, createAppContainer } from "react-navigation";
import ActionButton from 'react-native-circular-action-menu';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Modal from 'react-native-modalbox';
import firebase from 'firebase';
import {Transition, FluidNavigator} from 'react-navigation-fluid-transitions'

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

const CATEGORIES = {
	vgt: { COLOR: '#238364', ICON: "carrot" },
	fts: { COLOR: '#A02C2D', ICON: "apple-alt" },
	dry: { COLOR: '#FED797', ICON: "cheese" },
	mef: { COLOR: '#9E6B55', ICON: "drumstick-bite" },
	swt: { COLOR: '#CA7E8D', ICON: "ice-cream" },
	crl: { COLOR: '#AF6E4E', ICON: "bread-slice" },
	cln: { COLOR: '#5E96AE', ICON: "toilet-paper" },
	oth: { COLOR: '#909090', ICON: "cash-register" },
}

let moneyData = null

class Splash extends Component {
	constructor(props) {
		super(props)

		
	}

	componentDidMount(){

		async function fetchData(){
			let snapshot = await firebase.database().ref(`/money`)
            	.once('value');
			return snapshot.val()
		}

		fetchData().then(val => {
			// moneyData = val
			console.log("VAL", val)
			const { navigate } = this.props.navigation;
            navigate('Main', { moneyData: val})
		})
	}

	render() {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<Text style={{ color: 'black', fontSize: 25 }}> LOADING...</Text>
			</View>
		)
	}
}

class Main extends Component {
	constructor(props) {
		super(props);
		// Don't call this.setState() here!
		this.state = { selectedDay: null, modalVisible: false, catSelected: null, amount: "0" };

		const { navigation } = this.props;
		this.data = navigation.getParam('moneyData', null);
		
		console.log("Data",this.data)

		this.dataSet = null
	}


	_ondDayPressed = (day) => {
		this.setState({ selectedDay: day.dateString })
		this.parseTableData(day.dateString)
	}

	parseTableData = (dayString) => {
		let dayData = this.data[dayString] || null

		if (dayData != null)
			this.dataSet = Object.keys(dayData).map(function (key, index) {
				return { key: key, amount: dayData[key] }
			});
		else
			this.dataSet = null
	}

	_shouldRenderActionButton = () => {
		if (this.state.selectedDay)
			return (
				<ActionButton size={47} buttonColor="rgba(231,76,60,1)">
					<ActionButton.Item buttonColor={CATEGORIES.vgt.COLOR} title="Vegetables" onPress={this.categoryButtonPressed.bind(this, "vgt")}>
						<Icon name={CATEGORIES.vgt.ICON} style={styles.actionButtonIcon} />
					</ActionButton.Item>
					<ActionButton.Item buttonColor={CATEGORIES.fts.COLOR} title="Fruits" onPress={this.categoryButtonPressed.bind(this, "fts")}>
						<Icon name={CATEGORIES.fts.ICON} style={styles.actionButtonIcon} />
					</ActionButton.Item>
					<ActionButton.Item buttonColor={CATEGORIES.dry.COLOR} title="Dairy" onPress={this.categoryButtonPressed.bind(this, "dry")}>
						<Icon name={CATEGORIES.dry.ICON} style={styles.actionButtonIcon} />
					</ActionButton.Item>
					<ActionButton.Item buttonColor={CATEGORIES.mef.COLOR} title="Meet & Fish" onPress={this.categoryButtonPressed.bind(this, "mef")}>
						<Icon name={CATEGORIES.mef.ICON} style={styles.actionButtonIcon} />
					</ActionButton.Item>
					<ActionButton.Item buttonColor={CATEGORIES.swt.COLOR} title="Sweets" onPress={this.categoryButtonPressed.bind(this, "swt")}>
						<Icon name={CATEGORIES.swt.ICON} style={styles.actionButtonIcon} />
					</ActionButton.Item>
					<ActionButton.Item buttonColor={CATEGORIES.crl.COLOR} title="Cereals" onPress={this.categoryButtonPressed.bind(this, "crl")}>
						<Icon name={CATEGORIES.crl.ICON} style={styles.actionButtonIcon} />
					</ActionButton.Item>
					<ActionButton.Item buttonColor={CATEGORIES.cln.COLOR} title="Cleaning" onPress={this.categoryButtonPressed.bind(this, "cln")}>
						<Icon name={CATEGORIES.cln.ICON} style={styles.actionButtonIcon} />
					</ActionButton.Item>
					<ActionButton.Item buttonColor={CATEGORIES.oth.COLOR} title="Other" onPress={this.categoryButtonPressed.bind(this, "oth")}>
						<Icon name={CATEGORIES.oth.ICON} style={styles.actionButtonIcon} />
					</ActionButton.Item>
				</ActionButton>
			)

		return null
	}

	categoryButtonPressed = (category) => {
		this.setState({ catSelected: category })
		this.setModalVisible(!this.state.modalVisible)
	}

	setModalVisible(visible) {
		this.setState({ modalVisible: visible });
	}

	render() {
		return (
			<View style={{ flexDirection: 'column', flex: 1 }}>
				<StatusBar barStyle="light-content" />
				<Calendar
					onDayPress={this._ondDayPressed}
					markedDates={{
						[this.state.selectedDay]: { selected: true, disableTouchEvent: true }
					}}
				/>
				<View style={{ flex: 1, flexDirection: 'column', marginBottom: 10 }}>
					<FlatList
						data={this.dataSet}
						extraData={this.data}
						renderItem={({ item, index }) => {

							console.log("Index", index)
							console.log("===>", this.dataSet.length - 1)
							console.log("=======>", index % 2 === 1)
							let size = (((index === this.dataSet.length - 1) && ((index + 1) % 4 === 0)) ? width : width / 3)

							return (
								<View style={{ width: size, height: 100, alignItems: 'center', justifyContent: 'center' }}>
									<TouchableOpacity onPress={(event) => {
										const { navigate } = this.props.navigation;
										navigate('History', { cat: item.key})
									}}>
										<Transition shared={CATEGORIES[item.key].ICON}>
											<View style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: CATEGORIES[item.key].COLOR, alignItems: 'center', justifyContent: 'center' }}>
												<Icon size={40} color={CATEGORIES[item.key].COLOR} name={CATEGORIES[item.key].ICON} />
											</View>
										</Transition>
									</TouchableOpacity>
									<Text>{item.amount}</Text>
								</View>
							)
						}}
						keyExtractor={item => item.key}
						numColumns={3} />
				</View>
				{this._shouldRenderActionButton()}
				<Modal style={{
					height: 150,
					width: 300,
					padding: 10
				}} position={"center"} ref={"modal3"} isOpen={this.state.modalVisible}>
					<Text> Amount: </Text>
					<TextInput value={this.state.amount} onChangeText={(text) => this.setState({ amount: text })} keyboardType={'numeric'} style={{ marginVertical: 10 }} />
					<Button onPress={() => {
						this.data[this.state.selectedDay][this.state.catSelected] = this.data[this.state.selectedDay][this.state.catSelected] || 0
						this.data[this.state.selectedDay][this.state.catSelected] += parseInt(this.state.amount)
						this.parseTableData(this.state.selectedDay)
						this.setModalVisible(!this.state.modalVisible)
					}} style={{
						margin: 10,
						backgroundColor: "#3B5998",
						color: "white",
						padding: 10
					}}
						title="Add" />
				</Modal>
			</View >
		);
	}

};

class History extends Component{
	constructor(props){
		super(props)
		console.log("CONSTRUCTED")
		const { navigation } = this.props;
		this.cat = CATEGORIES[navigation.getParam('cat', null)].COLOR;
		this.icon = CATEGORIES[navigation.getParam('cat', null)].ICON;
	}

	componentDidMount(){
		console.log("MOUNTED")
	}

	render() {
		return (
			<View style={{ flex: 1, alignItems: 'center', marginTop: 20  }}>
				<Transition shared={this.icon}>
					<View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: this.cat, alignItems: 'center', justifyContent: 'center' }}>
						<Icon size={57} color={this.cat} name={this.icon} />
					</View>
				</Transition>
			</View>
		)
	}

	// render(){
	// 	// const { navigation } = this.props;
	// 	// this.cat = CATEGORIES[navigation.getParam('cat', null)].COLOR;
	// 	// // this.day = navigation.getParam('day', null);

	// 	// console.log("Cat", this.cat)
	// 	// console.log("Day", this.day)
	// 	console.log("RENDERED")

	// 	return(
	// 		<View style={{flex:"1"}}>
	// 			{/* <View style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: "#A02C2D", alignItems: 'center', justifyContent: 'center' }}>
	// 				<Icon size={40} color={"#A02C2D"} name={"apple-alt"} />
	// 			</View> */}
	// 		</View>
	// 	)
	// }
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
});

const AppNavigator = FluidNavigator(
	{
		Splash: {screen: Splash},
		Main: {screen: Main},
		History: {screen: History}
	},{
		initialRouteName: 'Splash'
	}
);

export default createAppContainer(AppNavigator);
