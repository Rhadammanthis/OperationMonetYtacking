
import React, { Component } from 'react';
import {
	AsyncStorage,
	StyleSheet,
	TouchableNativeFeedback,
	View, Text,
	Image,
	TextInput,
	Animated,
} from 'react-native';
import firebase from 'firebase';
import * as Progress from 'react-native-progress';
import LocalizedText from "../components/LocalizedText"
import { WIDTH, HEIGHT, SPENDLESS_BLUE, SPENDLESS_LIGHT_BLUE } from "../data/consts"


class Splash extends Component {
	constructor(props) {
		super(props)
		//161943 H&K
		this.state = { code: "", storedCode: null, settings: {}, animError: new Animated.Value(0), spinner: new Animated.Value(0), errorMessage: "", busy: false }
	}

	_storeData = async (code, password) => {
		try {
			await AsyncStorage.setItem('@persistentItem:code', code);
			await AsyncStorage.setItem('@persistentItem:password', password);
		} catch (error) {
			// Error saving data
		}
	};

	_retrieveData = async (code, password) => {
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
				let snapshot = await firebase.database().ref(`/users/${code}/`).once('value');

				if (snapshot.val() === null)
					return Promise.reject(new Error("No data available using that code"))

				const email = snapshot.val().email

				let user = await firebase.auth().signInWithEmailAndPassword(email, password)
					.catch((reason) => { return Promise.reject(reason.code) })

				var moneyData = await firebase.database().ref(`/${code}/`)
					.once('value')
					.then((value) => {
						return value.val() || { expenses: {}, shopping: [] }
					})
					.catch(errorMessage => {
						return errorMessage
					})

				return moneyData
			}
			catch (errorCode) {
				return Promise.reject(errorCode)
			}

		} catch (error) {
			return Promise.reject("system_error_async_storage")
		}
	};

	_retrieveSettings = async () => {
		try {
			const value = await AsyncStorage.getItem('@persistentItem:currency');

			if (value === null)
				return Promise.reject(new Error("No data"))

			this.setState({ settings: value })
			return value
		} catch (error) {
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

		return !busy
			?
			<View style={{ flexDirection: 'row', marginTop: 20 }}>
				<View style={{ flex: 1 }} />
				<View style={{ flex: 3 }}>
					<TextInput onChangeText={(text) => this.setState({ code: text })} style={{ backgroundColor: 'white', borderRadius: 10, marginVertical: 10 }} keyboardType={'numeric'} value={this.state.code} placeholder={'Account Code'}></TextInput>
					<TextInput onSubmitEditing={this.onSubmit.bind(this, code, password)} onChangeText={(text) => this.setState({ password: text })} style={{ backgroundColor: 'white', borderRadius: 10, marginVertical: 10 }} secureTextEntry={true} value={this.state.password} placeholder={'Password'}></TextInput>
					<TouchableNativeFeedback onPress={this.onSubmit.bind(this, code, password)}
						style={{ borderRadius: 20 }}>
						<View style={styles.button}>
							<LocalizedText localizationKey={"splash_button"} style={{ color: 'white' }}/>
						</View>
					</TouchableNativeFeedback>
					<TouchableNativeFeedback onPress={() => this.props.navigation.navigate('SignUpModal', { onCodeCreated: this.onCodeCreated })}>
						<LocalizedText localizationKey={"splash_dont_have"} style={{ textDecorationLine: 'underline', color: SPENDLESS_LIGHT_BLUE, textAlign: "center", marginVertical: 10 }} />
					</TouchableNativeFeedback>
				</View>
				<View style={{ flex: 1 }} />
			</View>
			: null
	}


	render() {
		const { animError, errorMessage, busy } = this.state
		return (
			<View style={{ flex: 1, justifyContent: 'center', backgroundColor: SPENDLESS_BLUE }}>
				<View style={{ alignItems: 'center', justifyContent: 'center', }}>
					<View style={[styles.logo, { borderWidth: busy ? 0 : 4 }]}>
						{busy ? <Progress.CircleSnail style={{ position: 'absolute' }} color={'white'} thickness={5} size={170} indeterminate={true} /> : null}
						<Image resizeMode={'contain'} style={{ width: 150, height: 150, borderRadius: 150, position: "absolute" }} source={require('../../img/logo.png')} />
					</View>
					<Text style={styles.title}> Spendless</Text>
				</View>
				{this._renderForm()}
				<Animated.View style={[styles.errorContainer, {
					transform: [{
						translateY: animError.interpolate({
							inputRange: [0, 1],
							outputRange: [150, HEIGHT * -.1]
						})
					}]
				}]}>
					<LocalizedText localizationKey={"errorMessage"} style={styles.errorMessage} />
				</Animated.View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	logo: { backgroundColor: SPENDLESS_BLUE, width: 160, height: 160, borderRadius: 80, borderColor: 'white', alignItems: 'center', justifyContent: 'center' },
	title: { color: 'white', fontSize: 25, fontWeight: 'bold', fontFamily: 'Roboto', marginTop: 10 },
	errorContainer: { backgroundColor: '#AA3C3B', borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginHorizontal: WIDTH / 6, position: 'absolute', bottom: 0 },
	button: { alignItems: 'center', justifyContent: 'center', backgroundColor: SPENDLESS_LIGHT_BLUE, paddingHorizontal: 20, borderRadius: 20, marginVertical: 10, paddingVertical: 10 },
	errorMessage: { color: 'white', textAlign: 'center', padding: 10, flex: 1 }
});

export default Splash