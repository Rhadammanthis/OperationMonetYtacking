
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
import { translate } from '../localization';


class Splash extends Component {
	constructor(props) {
		super(props)
		//161943 H&K
		this.state = { code: "", storedCode: null, settings: {}, animError: new Animated.Value(0), spinner: new Animated.Value(0), errorMessage: "", busy: true }
	}

	validateEmail = (email) => {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	_storeData = async () => {
		try {

			const {code, password} = this.state

			console.log(`Saving ${code} and ${password}`)

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

				if (!this.validateEmail(code)) {

					//It's not a valid email but doesn't mean is necesarely a code, Maybe it's just a malformed email. We need tro check for that too
					const emailChars = ["@", "."]
					if (emailChars.some(v => code.includes(v))) {
						return Promise.reject("system_error_no_data")
					}

					let snapshot = await firebase.database().ref(`/users/${code}/`).once('value');

					if (snapshot.val() === null)
						return Promise.reject("system_error_no_data")

					var email = snapshot.val().email
				} else {
					var email = code

					//Query for the user's data to retrieve the Account Code
					let user = await firebase.database().ref('/users').orderByChild("email").equalTo(email).once('value')
						.catch((reason) => { return Promise.reject("system_error_no_data") })

					//Now that we know which user has that email, extract the Account Code
					code = Object.keys(user.val())[0]

					this.setState({code: code})
				}

				console.log(`Email: ${email}, Password: ${password}, Code: ${code}`)

				//Sign user in to check credentials
				let loggedInUser = await firebase.auth().signInWithEmailAndPassword(email, password)
					.catch((reason) => { return Promise.reject(reason.code) })

				var moneyData = await firebase.database().ref(`/${code}/`)
					.once('value')
					.then((value) => {
						console.log("Value",value.val())
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
			'didBlur',
			payload => {
				console.log("Blurred")
				this.setState({ busy: false, code: "", password: "" })
			}
		);

		this.didFocusSubscription = this.props.navigation.addListener(
			'didFocus',
			payload => {
				if (payload.lastState != null)
					this.setState({ busy: false })
			}
		);


		this._retrieveSettings()
			.then((value) => this._retrieveData()
				.then(expensesData => {
					this.props.navigation.navigate('Main', { expensesData: expensesData, code: this.state.code, currency: this.state.settings })
				})
				.catch(error => {
					this.setState({ busy: false })
					this.animateErrorMessage(error)
				}))
			.catch((error) => this.props.navigation.navigate('Tutorial'))

	}

	componentWillUnmount() {
		this.didBlurSubscription.remove()
		this.didFocusSubscription.remove()
	}

	onSubmit = (code, password) => {

		this._retrieveSettings().then(
			(value) => {
				this._retrieveData(code, password)
					.then((expensesData) =>
						this._storeData()
							.then(value => {
								this.props.navigation.navigate('Main', { expensesData: expensesData, code: this.state.code, currency: this.state.settings })
							})
					)
					.catch((error) => {
						this.setState({ busy: false })
						this.animateErrorMessage(error)
					})
			}
		)
	}

	onCodeCreated = (code, password) => {
		this.setState({ code: code.toString(), password: password })
	}

	animateErrorMessage = (message) => {

		console.log("Message", message)

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
					<TextInput onChangeText={(text) => this.setState({ code: text })} style={{ backgroundColor: 'white', borderRadius: 10, marginVertical: 10 }} value={this.state.code} placeholder={translate("splash_user_name")}></TextInput>
					<TextInput onSubmitEditing={this.onSubmit.bind(this, code, password)} onChangeText={(text) => this.setState({ password: text })} style={{ backgroundColor: 'white', borderRadius: 10, marginVertical: 10 }} secureTextEntry={true} value={this.state.password} placeholder={translate("splash_password")}></TextInput>
					<TouchableNativeFeedback onPress={this.onSubmit.bind(this, code, password)}
						style={{ borderRadius: 20 }}>
						<View style={styles.button}>
							<LocalizedText localizationKey={"splash_button"} style={{ color: 'white' }} />
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
					<LocalizedText localizationKey={errorMessage} style={styles.errorMessage} />
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