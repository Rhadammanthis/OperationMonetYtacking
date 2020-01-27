import React, { Component } from 'react';
import {
    TouchableNativeFeedback,
    View, Text, TextInput,
    StyleSheet, Animated,
    LayoutAnimation
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import firebase from 'firebase';
import * as Progress from 'react-native-progress';
import { country, translate } from "../localization"
import { SPENDLESS_BLUE, SPENDLESS_LIGHT_BLUE, HEIGHT, WIDTH } from "../data/consts"
import LocalizedText from "../components/LocalizedText"

class SignUpModal extends Component {
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

                    var code = Math.floor(100000 + Math.random() * 900000)
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
                .catch((reason) => {
                    backwardsAnimation.start()
                    console.log("Error", reason)
                    setTimeout(() => { this.animateErrorMessage(reason.code) }, 200)
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
            <View style={{ flex: 1, backgroundColor: SPENDLESS_BLUE, justifyContent: "center", alignItems: "center" }}>
                <LocalizedText localizationKey={accountCreated ? "account_title_done" : "account_title"} style={styles.title} />
                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                    <View style={{ flex: 1 }} />
                    {accountCreated ?
                        <View style={{ flex: 3 }}>
                            <View style={{ justifyContent: 'center', alignItems: "center", marginVertical: 20 }}>
                                <View style={styles.checkMark}>
                                    <Icon color={'white'} size={60} name="check-circle" />
                                </View>
                            </View>
                            <LocalizedText localizationKey={"account_code"} style={{ color: "white", textAlign: 'center', fontSize: 18 }} />
                            <Text style={{ color: "white", fontSize: 30, marginVertical: 10, textAlign: 'center' }}>{code.toString()}</Text>
                            <LocalizedText localizationKey={"account_share"} style={{ color: "white", paddingHorizontal: 5, textAlign: 'center', fontSize: 18 }} />
                            <TouchableNativeFeedback onPress={(event) => { this.props.navigation.state.params.onCodeCreated(code, password); this.props.navigation.goBack() }}
                                style={{ borderRadius: 20 }}>
                                <View style={styles.button}>
                                    <LocalizedText localizationKey={"account_button_log_in"} style={{ color: 'white' }} />
                                </View>
                            </TouchableNativeFeedback>
                        </View> :
                        <View style={{ flex: 3 }}>
                            <LocalizedText localizationKey={"account_email"} style={{ color: "white" }} />
                            <TextInput editable={editable} onChangeText={(text) => this.setState({ email: text })} style={styles.textInput} keyboardType={'email-address'} value={this.state.email} placeholder={translate("account_email_hint")}></TextInput>
                            <LocalizedText localizationKey={"account_password"} style={{ color: "white", marginTop: 10 }} />
                            <TextInput editable={editable} onChangeText={(text) => this.setState({ password: text })} style={styles.textInput} secureTextEntry={true} value={this.state.password} placeholder={translate("account_password_hint")}></TextInput>
                            <LocalizedText localizationKey={"account_repeat_password"} style={{ color: "white", marginTop: 10 }} />
                            <TextInput editable={editable} onChangeText={(text) => this.setState({ repeatPassword: text })} style={styles.textInput} secureTextEntry={true} value={this.state.repeatPassword} placeholder={translate("account_repeat_password_hint")}></TextInput>
                            <TouchableNativeFeedback onPress={this.onSubmit.bind(this, this.state.email, this.state.password)}
                                style={{ borderRadius: 20 }}>
                                <View style={styles.signUpButton}>
                                    <LocalizedText localizationKey={"account_button_sign_up"} style={{ color: 'white' }} />
                                </View>
                            </TouchableNativeFeedback>
                        </View>}
                    <View style={{ flex: 1 }} />
                </View>
                <Animated.View style={{
                    position: "absolute", bottom: 0, transform: [{
                        translateY: spinner.interpolate({
                            inputRange: [0, 1],
                            outputRange: [HEIGHT + 150, HEIGHT * -.1]
                        })
                    }]
                }}>
                    <Progress.Circle thickness={15} size={50} indeterminate={true} />
                </Animated.View>
                <Animated.View style={[styles.errorContainer, {
                    transform: [{
                        translateY: animError.interpolate({
                            inputRange: [0, 1],
                            outputRange: [150, HEIGHT * -.1]
                        })
                    }]
                }]}>
                    <LocalizedText localizationKey={errorMessage} style={styles.error} />
                </Animated.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    title: { color: "white", textAlign: 'center', fontSize: 30, paddingHorizontal: 20 },
    checkMark: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: 'center', backgroundColor: '#afc474' },
    button: { alignItems: 'center', justifyContent: 'center', backgroundColor: SPENDLESS_LIGHT_BLUE, paddingHorizontal: 20, borderRadius: 20, marginVertical: 20, paddingVertical: 10 },
    signUpButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: SPENDLESS_LIGHT_BLUE, paddingHorizontal: 20, borderRadius: 20, marginVertical: 20, paddingVertical: 10 },
    textInput: { backgroundColor: 'white', borderRadius: 10, marginVertical: 5 },
    errorContainer: { backgroundColor: '#AA3C3B', borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginHorizontal: WIDTH / 6, position: 'absolute', bottom: 0 },
    error: { color: 'white', textAlign: 'center', padding: 10, flex: 1 }
});

export default SignUpModal