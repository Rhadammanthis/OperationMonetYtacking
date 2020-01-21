/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component, useState, useEffect, useCallback } from 'react';
import { LocaleConfig, CalendarList } from 'react-native-calendars';
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
import { StackActions, createAppContainer, createStackNavigator, ScrollView } from "react-navigation";
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Modal from 'react-native-modalbox';
import firebase from 'firebase';
import { Transition, FluidNavigator } from 'react-navigation-fluid-transitions'
import { FlatGrid } from 'react-native-super-grid';
import * as Progress from 'react-native-progress';
import { PieChart } from 'react-native-svg-charts'
import * as Data from './data/data'
import Carousel from '@rhysforyou/react-native-carousel'
import { translate, country } from "./src/localization"


var { height, width } = Dimensions.get('window');
console.log('Height', height)

const calendarDayTextSize = height < 600 ? 14 : 15
const calendarMonthTextSize = height < 600 ? 20 : 30
const panelOffset = (height * -0.27)

const CATEGORIES = {
	vgt: { COLOR: '#238364', ICON: "carrot", NAME: translate("main_category_vegetables") },
	fts: { COLOR: '#afc474', ICON: "apple-alt", NAME: translate("main_category_fruits") },
	dry: { COLOR: '#F99D33', ICON: "cheese", NAME: translate("main_category_dairy") },
	mef: { COLOR: '#AA3C3B', ICON: "drumstick-bite", NAME: translate("main_category_meets") },
	swt: { COLOR: '#CA7E8D', ICON: "ice-cream", NAME: translate("main_category_sweets") },
	crl: { COLOR: '#71503A', ICON: "bread-slice", NAME: translate("main_category_cereals") },
	cln: { COLOR: '#5E96AE', ICON: "toilet-paper", NAME: translate("main_category_hygiene") },
	oth: { COLOR: '#909090', ICON: "cash-register", NAME: translate("main_category_other") },
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
		this.state = { code: "", storedCode: null, settings: {}, animError: new Animated.Value(0), spinner: new Animated.Value(0), errorMessage: "", busy: false }

		var didBlurSubscription
	}

	_storeData = async (code, password) => {
		console.log("STORE DATA")
		try {
			await AsyncStorage.setItem('@persistentItem:code', code);
			await AsyncStorage.setItem('@persistentItem:password', password);
			console.log("Saved!")
		} catch (error) {
			// Error saving data
		}
	};

	validateEmail = (email) => {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	_retrieveData = async (code, password) => {
		console.log("RETRIEVE DATA")
		try {
			var pCode = await AsyncStorage.getItem('@persistentItem:code')
			var pPassword = await AsyncStorage.getItem('@persistentItem:password')

			code = pCode ? pCode : undefined || code;
			password = pPassword ? pPassword : undefined || password;


			if (code === undefined)
				return Promise.reject("system_erro_code_needed")
			if (password === undefined)
				return Promise.reject("system_error_password_needed")


			this.setState({ busy: true, code: code })

			try {

				if (!this.validateEmail(code)) {
					let snapshot = await firebase.database().ref(`/users/${code}/`).once('value');

					if (snapshot.val() === null)
						return Promise.reject("system_error_no_data")

					var email = snapshot.val().email
				} else {
					var email = code
				}

				let user = await firebase.auth().signInWithEmailAndPassword(email, password)
					.catch((reason) => { return Promise.reject(reason.code) })
				console.log("LOGGED IN", user)

				var moneyData = await firebase.database().ref(`/${code}/`)
					.once('value')
					.then((value) => {
						return value.val() || { expenses: {}, shopping: [] }
					})
					.catch(errorMessage => {
						console.log("Error", errorMessage)
						return errorMessage
					})


				return moneyData

				// return snapshot.val();
			}
			catch (errorCode) {
				return Promise.reject(errorCode)
			}

		} catch (error) {
			return Promise.reject("system_error_async_storage")
		}
	};

	_retrieveSettings = async () => {
		console.log("RETRIEVE SETTINGS")
		try {
			const value = await AsyncStorage.getItem('@persistentItem:currency');
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

		this.didBlurSubscription = this.props.navigation.addListener(
			'didFocus',
			payload => {
				this.setState({ busy: false, code: "" })
			}
		);


		this._retrieveSettings()
			.then((value) => this._retrieveData()
				.then(value => {
					console.log("Retrieve data success", value)
					this.props.navigation.navigate('Main', { moneyData: value, code: this.state.code, currency: this.state.settings })
				})
				.catch(error => {
					this.animateErrorMessage(error)
				}))
			.catch((error) => this.props.navigation.navigate('Tutorial'))

	}

	componentWillUnmount() {
		this.didBlurSubscription.remove()
	}

	onSubmit = (code, password) => {


		this._retrieveSettings().then(
			(value) => {
				this._retrieveData(code, password)
					.then((moneyData) =>
						this._storeData(code, password)
							.then(value => {
								console.log("Retrieve data success SUBMIT1", moneyData)
								this.props.navigation.navigate('Main', { moneyData: moneyData, code: this.state.code, currency: this.state.settings })
							})
					)
					.catch((error) => {
						this.animateErrorMessage(error)
					})
					.finally(() => this.setState({ busy: false }))
			}
		)
	}

	onCodeCreated = (code, password) => {
		this.setState({ code: code.toString(), password: password })
	}

	animateErrorMessage = (message) => {

		this.setState({ errorMessage: message })

		const forwardsAnimation = Animated.spring(this.state.animError, {
			toValue: 1,
			duration: 200,
			friction: 8,
			tension: 50,
			useNativeDriver: true
		})

		const backwardsAnimation = Animated.spring(this.state.animError, {
			toValue: 0,
			duration: 300,
			friction: 8,
			tension: 50,
			useNativeDriver: true
		})

		forwardsAnimation.start()
		setTimeout(() => { backwardsAnimation.start() }, 3000)

	}

	_renderForm = () => {

		const { busy, code, password } = this.state

		console.log("RENDER FORM?", busy)

		return !busy
			?
			<View style={{ flexDirection: 'row', marginTop: 20 }}>
				<View style={{ flex: 1 }} />
				<View style={{ flex: 3 }}>
					<TextInput onChangeText={(text) => this.setState({ code: text })} style={{ backgroundColor: 'white', borderRadius: 10, marginVertical: 10 }} value={this.state.code} placeholder={translate("splash_user_name")}></TextInput>
					<TextInput onSubmitEditing={this.onSubmit.bind(this, code, password)} onChangeText={(text) => this.setState({ password: text })} style={{ backgroundColor: 'white', borderRadius: 10, marginVertical: 10 }} secureTextEntry={true} value={this.state.password} placeholder={translate("splash_password")}></TextInput>
					<TouchableNativeFeedback onPress={this.onSubmit.bind(this, code, password)}
						style={{ borderRadius: 20 }}>
						<View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: BLU_LIGHT, paddingHorizontal: 20, borderRadius: 20, marginVertical: 10, paddingVertical: 10 }}>
							<Text style={{ color: 'white' }}> {translate("splash_button")} </Text>
						</View>
					</TouchableNativeFeedback>
					<TouchableNativeFeedback onPress={() => this.props.navigation.navigate('MyModal', { onCodeCreated: this.onCodeCreated })}>
						<Text style={{ textDecorationLine: 'underline', color: BLU_LIGHT, textAlign: "center", marginVertical: 10 }}>{translate("splash_dont_have")} </Text>
					</TouchableNativeFeedback>
				</View>
				<View style={{ flex: 1 }} />
			</View>
			: null
	}


	render() {
		const { animError, errorMessage, busy } = this.state
		return (
			<View style={{ flex: 1, justifyContent: 'center', backgroundColor: BLU }}>
				<View style={{ alignItems: 'center', justifyContent: 'center', }}>
					<View style={{ backgroundColor: BLU, width: 160, height: 160, borderRadius: 80, borderColor: 'white', borderWidth: busy ? 0 : 4, alignItems: 'center', justifyContent: 'center' }}>
						{busy ? <Progress.CircleSnail style={{ position: 'absolute' }} color={'white'} thickness={5} size={170} indeterminate={true} /> : null}
						<Image resizeMode={'contain'} style={{ width: 150, height: 150, borderRadius: 150, position: "absolute" }} source={require('./img/logo.png')} />
					</View>
					<Text style={{ color: 'white', fontSize: 25, fontWeight: 'bold', fontFamily: 'Roboto', marginTop: 10 }}> Spendless</Text>
				</View>
				{this._renderForm()}
				<Animated.View style={[{ backgroundColor: '#AA3C3B', borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginHorizontal: width / 6, position: 'absolute', bottom: 0 }, {
					transform: [{
						translateY: animError.interpolate({
							inputRange: [0, 1],
							outputRange: [150, height * -.1]
						})
					}]
				}]}>
					<Text style={{ color: 'white', textAlign: 'center', padding: 10, flex: 1 }}>{translate(errorMessage)}</Text>
				</Animated.View>
			</View>
		)
	}
}

class ModalScreen extends React.Component {
	constructor(props) {
		super(props)
		//161943 H&K
		this.state = { email: "", password: "", animError: new Animated.Value(0), spinner: new Animated.Value(0), editable: true, done: false, code: null }

	}

	animateErrorMessage = (message) => {

		this.setState({ errorMessage: message })

		const forwardsAnimation = Animated.spring(this.state.animError, {
			toValue: 1,
			duration: 200,
			friction: 8,
			tension: 50,
			useNativeDriver: true
		})

		const backwardsAnimation = Animated.spring(this.state.animError, {
			toValue: 0,
			duration: 300,
			friction: 8,
			tension: 50,
			useNativeDriver: true
		})

		forwardsAnimation.start()
		setTimeout(() => { backwardsAnimation.start() }, 3000)

	}

	onSubmit = (email, password) => {


		const forwardsAnimation = Animated.spring(this.state.spinner, {
			toValue: 1,
			duration: 500,
			friction: 8,
			tension: 50,
			useNativeDriver: true
		})

		const backwardsAnimation = Animated.spring(this.state.spinner, {
			toValue: 0,
			duration: 1000,
			friction: 8,
			tension: 50,
			useNativeDriver: true
		})

		this.setState({ editable: false })

		if (password !== this.state.repeatPassword) {
			this.animateErrorMessage("system_error_passwords_match")
			this.setState({ editable: true })
			return
		}


		forwardsAnimation.start()

		setTimeout(() => {
			firebase.auth()
				.createUserWithEmailAndPassword(email, password)
				.then((value) => {
					firebase.database().ref(`/users`).once('value')
						.then((snap) => {

							var userCodes = Object.keys(snap.val())
							var code = Math.floor(100000 + Math.random() * 900000).toString()

							while (userCodes.includes(code)) {
								code = Math.floor(100000 + Math.random() * 900000).toString()
							}

							var userData = { email: email, dateCreated: new Date().getTime(), country: country }

							this.pushData(`/users/${code}/`, userData, () => {
								backwardsAnimation.start()
								LayoutAnimation.configureNext({
									duration: 700,
									create: {
										type: LayoutAnimation.Types.spring,
										property: LayoutAnimation.Properties.scaleXY,
										springDamping: 1,
										duration: 600
									},
									update: {
										type: LayoutAnimation.Types.spring,
										property: LayoutAnimation.Properties.scaleXY,
										springDamping: 1,
										duration: 600
									},
									delete: {
										type: LayoutAnimation.Types.easeOut,
										property: LayoutAnimation.Properties.opacity,
										springDamping: 1,
										duration: 400
									}
								})

								this.setState({ code: code })
							})
						})
				})
				.catch((reason) => {
					backwardsAnimation.start()
					console.log("Error", reason)
					setTimeout(() => { this.animateErrorMessage(reason.code) }, 200)
					// this.animateErrorMessage(reason.message)
				})
				.finally(() => this.setState({ editable: true }))
		}, 1500)

	}

	pushData = async (ref, value, callback) => {
		console.log(ref)
		let snapshot = await firebase.database().ref(ref)
			.set(value)
			.then((value) => callback())

		console.log(snapshot.val())
	}

	render() {
		const { animError, errorMessage, spinner, editable, code, password } = this.state
		var accountCreated = code !== null;
		return (
			<View style={{ flex: 1, backgroundColor: BLU, justifyContent: "center", alignItems: "center" }}>
				<Text style={{ color: "white", textAlign: 'center', fontSize: 30, paddingHorizontal: 20 }}>{translate(accountCreated ? "account_title_done" : "account_title")}</Text>
				<View style={{ flexDirection: 'row', marginTop: 20 }}>
					<View style={{ flex: 1 }} />
					{accountCreated ?
						<View style={{ flex: 3 }}>
							<View style={{ justifyContent: 'center', alignItems: "center", marginVertical: 20 }}>
								<View style={{ width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: 'center', backgroundColor: '#afc474' }}>
									<Icon color={'white'} size={60} name="check-circle" />
								</View>
							</View>
							<Text style={{ color: "white", textAlign: 'center', fontSize: 18 }}>{translate("account_code")}</Text>
							<Text style={{ color: "white", fontSize: 30, marginVertical: 10, textAlign: 'center' }}>{code.toString()}</Text>
							<Text style={{ color: "white", paddingHorizontal: 5, textAlign: 'center', fontSize: 18 }}>{translate("account_share")}</Text>
							<TouchableNativeFeedback onPress={(event) => { this.props.navigation.state.params.onCodeCreated(code, password); this.props.navigation.goBack() }}
								style={{ borderRadius: 20 }}>
								<View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: BLU_LIGHT, paddingHorizontal: 20, borderRadius: 20, marginVertical: 20, paddingVertical: 10 }}>
									<Text style={{ color: 'white' }}> {translate("account_button_log_in")} </Text>
								</View>
							</TouchableNativeFeedback>
						</View> :
						<View style={{ flex: 3 }}>
							<Text style={{ color: "white" }}>{translate("account_email")}</Text>
							<TextInput editable={editable} onChangeText={(text) => this.setState({ email: text })} style={{ backgroundColor: 'white', borderRadius: 10, marginVertical: 5 }} keyboardType={'email-address'} value={this.state.email} placeholder={translate("account_email_hint")}></TextInput>
							<Text style={{ color: "white", marginTop: 10 }}>{translate("account_password")}</Text>
							<TextInput editable={editable} onChangeText={(text) => this.setState({ password: text })} style={{ backgroundColor: 'white', borderRadius: 10, marginVertical: 5 }} secureTextEntry={true} value={this.state.password} placeholder={translate("account_password_hint")}></TextInput>
							<Text style={{ color: "white", marginTop: 10 }}> {translate("account_repeat_password")} </Text>
							<TextInput editable={editable} onChangeText={(text) => this.setState({ repeatPassword: text })} style={{ backgroundColor: 'white', borderRadius: 10, marginVertical: 5 }} secureTextEntry={true} value={this.state.repeatPassword} placeholder={translate("account_repeat_password_hint")}></TextInput>
							<TouchableNativeFeedback onPress={this.onSubmit.bind(this, this.state.email, this.state.password)}
								style={{ borderRadius: 20 }}>
								<View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: BLU_LIGHT, paddingHorizontal: 20, borderRadius: 20, marginVertical: 20, paddingVertical: 10 }}>
									<Text style={{ color: 'white' }}> {translate("account_button_sign_up")}</Text>
								</View>
							</TouchableNativeFeedback>
						</View>}
					<View style={{ flex: 1 }} />
				</View>
				<Animated.View style={{
					position: "absolute", bottom: 0, transform: [{
						translateY: spinner.interpolate({
							inputRange: [0, 1],
							outputRange: [height + 150, height * -.1]
						})
					}]
				}}>
					<Progress.Circle thickness={15} size={50} indeterminate={true} />
				</Animated.View>
				<Animated.View style={[{ backgroundColor: '#AA3C3B', borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginHorizontal: width / 6, position: 'absolute', bottom: 0 }, {
					transform: [{
						translateY: animError.interpolate({
							inputRange: [0, 1],
							outputRange: [150, height * -.1]
						})
					}]
				}]}>
					<Text style={{ color: 'white', textAlign: 'center', padding: 10, flex: 1 }}>{translate(errorMessage)}</Text>
				</Animated.View>
			</View>
		);
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
			await AsyncStorage.setItem('@persistentItem:currency', country.currency);
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
					.then((value) => { console.log(value); this.props.navigation.dispatch(StackActions.popToTop()) })
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
					<Text style={{ color: 'white' }}> {translate("currency_button")} </Text>
				</Animated.View>
			</TouchableNativeFeedback>
		)
	}

	render() {
		return (
			<View style={{ flex: 1, justifyContent: 'center', backgroundColor: BLU, alignItems: 'center' }}>
				<Text style={{ color: 'white', textAlign: 'center', fontSize: 25, maxWidth: width * 0.75, marginVertical: 25 }}>
					{translate("currency_message")}
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

class Tutorial extends Component {
	constructor(props) {
		super(props)
		this.state = { animCloseButton: new Animated.Value(0) }
	}

	componentDidMount() {

	}

	_renderAcceptButton = () => {
		const { animCloseButton, selectedCountry } = this.state

		return (
			<TouchableNativeFeedback onPress={(evnt) => {
				this.props.navigation.navigate('Currency')
			}}
				style={{ borderRadius: 20 }}>
				<Animated.View style={[{ alignItems: 'center', justifyContent: 'center', backgroundColor: BLU_LIGHT, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }, {
					transform: [{
						translateY: animCloseButton.interpolate({
							inputRange: [0, 1],
							outputRange: [100, -10]
						})
					}]
				}]}>
					<Text style={{ color: 'white' }}> {translate("tutorial_button")} </Text>
				</Animated.View>
			</TouchableNativeFeedback>
		)
	}


	render() {

		const springAnimation = Animated.spring(this.state.animCloseButton, {
			toValue: 1,
			duration: 200,
			friction: 8,
			tension: 50,
			useNativeDriver: true
		})

		return (
			<View style={{ backgroundColor: BLU, flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text style={{ textAlign: 'center', color: 'white', fontSize: 30, marginVertical: 20 }}>
					{translate("tutorial_header_title")}
				</Text>
				<Carousel
					style={{ backgroundColor: BLU }}
					onEndReached={(distanceFromEnd) => { console.log("THE END"); springAnimation.start() }}
					data={[
						{
							id: "0",
							title: translate("tutorial_card_0_title"),
							description: translate("tutorial_card_0_description"),
							image: require("./img/account_smol.png")
						},
						{
							id: "2",
							title: translate("tutorial_card_1_title"),
							description: translate("tutorial_card_1_description"),
							image: require("./img/screen_grab_1_smol.png")
						},
						{
							id: "3",
							title: translate("tutorial_card_2_title"),
							description: translate("tutorial_card_2_description"),
							image: require("./img/screen_grab_2_smol.png")
						},
						{
							id: "4",
							title: translate("tutorial_card_3_title"),
							description: translate("tutorial_card_3_description"),
							image: require("./img/screen_grab_3_smol.png")
						},
						{
							id: "5",
							title: translate("tutorial_card_4_title"),
							description: translate("tutorial_card_4_description"),
							image: require("./img/screen_grab_4_smol.png")
						},
					]}
					renderItem={info => (
						<View style={{ flex: 1 }}>
							<Text style={{ color: '#000000DD', textAlign: "center", fontSize: 20 }}>{info.item.title}</Text>
							<Text style={{ color: '#000000DD', textAlign: "center", fontSize: 17, marginVertical: 5 }}>{info.item.description}</Text>
							<Image style={{ flex: 1, aspectRatio: 0.5, alignSelf: "center" }} source={info.item.image} />
						</View>
					)}
					keyExtractor={item => item.id}>
				</Carousel>
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

		console.log("Currency", currency)
		console.log("Item Amount", item)

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

		console.log("I GOT TO MAIN")

		this.state = {
			selectedDay: null, modalVisible: false, catSelected: "vgt",
			amount: null, dayExpenses: [], refresh: false, renderTotal: false, anim: new Animated.Value(0),
			open: false, showSummary: false, lastDay: null, top: Math.floor(height / 2), selectedSlice: {
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
				else {
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
				svg: { fill: CATEGORIES[key].COLOR },
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
							style={{ height: height * 0.45 }}
							outerRadius={'85%'}
							innerRadius={'55%'}
							data={data}
						/>
						<View style={{
							left: (350 / 2 - (width * 0.150)), position: 'absolute', width: width * 0.3, height: width * 0.3,
							borderRadius: width * 0.150, borderWidth: 3, borderColor: CATEGORIES[label].COLOR, backgroundColor: "#FFFFFFEE",
							padding: 5, alignItems: 'center', justifyContent: 'center'
						}}>
							<Icon style={{ marginVertical: 5 }} size={30} color={CATEGORIES[label].COLOR} name={CATEGORIES[label].ICON} />
							<Text style={{ color: CATEGORIES[label].COLOR, marginTop: 5 }}>{CATEGORIES[label].NAME}</Text>
							<Text style={{ color: CATEGORIES[label].COLOR }}>{value} {this.currency}</Text>
						</View>
					</View>
					:
					<Text style={{ color: "black", textAlign: 'center', color: 'white', fontSize: 17 }}> {translate("main_monthly_summary_no_data")} </Text>
			)

		}

		return (
			<Modal style={{
				height: height * 0.6,
				width: 350,
				borderRadius: 10,
				backgroundColor: BLU
			}} onClosed={() => { this.setState({ showSummary: false, selectedSlice: { label: 'vgt', value: 0 } }) }}
				position={"center"} ref={"modal3"} isOpen={this.state.showSummary}
				animationDuration={350} swipeToClose={false}>
				<Text style={{ textAlign: 'center', paddingLeft: 10, fontSize: 25, color: 'white', paddingVertical: 10 }}>
					{translate("main_monthly_summary_title")}
				</Text>
				<View style={{ justifyContent: 'center', flex: 1 }}>
					{_renderPieChart()}
				</View>
				<Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 20, color: 'white', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: BLU, justifyContent: 'center', alignItems: 'center', paddingVertical: 10 }}>
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
				<Text style={{ color: 'white', fontWeight: 'bold', fontSize: 17 }}> {translate("main_day_total")} {applyMoneyMask(dailyExpensesSum)} {this.currency}</Text>
			)
		}

		return null
	}

	pushData = async (data) => {
		let snapshot = await firebase.database().ref(`/${this.props.navigation.getParam('code', null)}/expenses`).update(data)
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
						<Text style={{ fontSize: 20 }}> {translate("main_add_expense_title")} </Text>
						<Text style={{ fontSize: 15, marginTop: 5 }}> {translate("main_add_expense_content")} </Text>
						<View style={{ alignItems: 'center', flexDirection: 'row' }}>
							<TextInput onSubmitEditing={Keyboard.dismiss} placeholder={translate("main_add_expense_hint")} value={this.state.amount} onChangeText={(text) => this.setState({ amount: text })} keyboardType={'numeric'} style={{ flex: 1, marginVertical: 0, borderBottomWidth: 2, borderColor: this.getCategoryColor(this.state.catSelected) }} />
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
							title={translate("main_add_expense_button")} />
					</View>
				</Modal>
				{this._renderSummaryModal(this.currentMonth)}
				<ActionButton onPress={() => { this.setState({ showSummary: true }) }} renderIcon={(active) => {
					return <Icon color={'white'} size={15} name="chart-line" />
				}} offsetY={15} offsetX={120} spacing={15} verticalOrientation="down" position="right" spacing={15} fixNativeFeedbackRadius={true} position="right" backdrop={
					<View style={{ position: 'absolute', top: 0, left: 0, height: height, width: width, backgroundColor: 'black', opacity: 1 }}></View>
				} size={40} buttonColor={BLU_LIGHT}>
				</ActionButton>
				<ActionButton onPress={() => { console.log("CODE", this.code); this.props.navigation.navigate('ShoppingList', { shopping: this.shopping, code: this.code }) }} renderIcon={(active) => {
					return <Icon color={'white'} size={15} name="tasks" />
				}} offsetY={15} offsetX={70} spacing={15} verticalOrientation="down" position="right" spacing={15} fixNativeFeedbackRadius={true} position="right" size={40} buttonColor={BLU_LIGHT}>
				</ActionButton>
				<ActionButton onPress={() => { console.log("CODE", this.code); this.props.navigation.navigate('Profile', { code: this.code }) }} renderIcon={(active) => {
					return <Icon color={'white'} size={15} name="user" />
				}} offsetY={15} offsetX={20} spacing={15} verticalOrientation="down" position="right" spacing={15} fixNativeFeedbackRadius={true} position="right" size={40} buttonColor={BLU_LIGHT}>
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
						<Text style={{ fontSize: 25, color: 'black' }}>{translate("history_amount")}</Text>
						<View style={{ flex: 1 }} />
						<Text style={{ fontSize: 25 }}>{translate("history_time")}</Text>
					</View>
					{this._renderHistory()}
				</View>
			</View>
		)
	}
}

class Profile extends Component {
	constructor(props) {
		super(props)
		this.state = { refresh: false }

		this.code = this.props.navigation.getParam('code', null)
		this.user = firebase.auth().currentUser

		console.log(this.code)
	}

	componentDidMount() {


	}

	render() {
		return (
			<View style={{ flex: 1, flexDirection: 'column', backgroundColor: BLU, paddingHorizontal: 20 }}>
				<Text style={{ color: 'white', fontSize: 35, marginVertical: 20 }}>{translate("profile_title")}</Text>
				<Text style={{ color: 'white', fontSize: 20 }}>{translate("profile_email")}</Text>
				<Text style={{ color: 'white', fontSize: 17 }}>{this.user.email}</Text>
				<Text style={{ color: 'white', fontSize: 20, marginTop: 10 }}>{translate("profile_account")}</Text>
				<Text style={{ color: 'white', fontSize: 17 }}>{this.code}</Text>
				<View style={{ flex: 1 }} />
				<TouchableNativeFeedback onPress={(event) => {
					firebase.auth().signOut()
						.then((value) => {
							AsyncStorage.multiRemove(["@persistentItem:password", "@persistentItem:code"])
								.then((value) => { this.props.navigation.dispatch(StackActions.popToTop()) })
						})
				}}
					style={{ borderRadius: 20 }}>
					<View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: "#AA3C3B", paddingHorizontal: 20, borderRadius: 20, marginVertical: 20, paddingVertical: 10 }}>
						<Text style={{ color: 'white' }}>{translate("profile_button_log_out")}</Text>
					</View>
				</TouchableNativeFeedback>
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
				<Text allowFontScaling style={{ color: 'white', fontSize: 40, margin: 20, paddingRight: 45 }}>{translate("shopping_list_title")}</Text>
				{this._renderShoppingList(this.shoppingList)}
				<View style={{ flex: 1 }} />
				<View style={{ flexDirection: 'row', margin: 10, justifyContent: 'space-between' }}>
					<TextInput style={{ flex: 1, backgroundColor: 'white', borderRadius: 10 }} placeholder={translate("shopping_list_hint")} value={this.state.extraItemText} onChangeText={(text) => this.setState({ extraItemText: text })} />
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
		MyModal: {
			screen: ModalScreen,
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
