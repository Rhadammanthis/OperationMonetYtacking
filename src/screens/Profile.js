import React, { Component } from 'react';
import {
    AsyncStorage,
    TouchableNativeFeedback,
    View, Text, StyleSheet
} from 'react-native';
import { StackActions } from "react-navigation";
import firebase from 'firebase';
import { SPENDLESS_BLUE } from "../data/consts"
import LocalizedText from "../components/LocalizedText"

class Profile extends Component {
    constructor(props) {
        super(props)
        this.state = { refresh: false }

        this.code = this.props.navigation.getParam('code', null)
        this.user = firebase.auth().currentUser
    }

    componentDidMount() {


    }

    render() {
        return (
            <View style={{ flex: 1, flexDirection: 'column', backgroundColor: SPENDLESS_BLUE, paddingHorizontal: 20 }}>
                <LocalizedText localizationKey={"profile_title"} style={{ color: 'white', fontSize: 35, marginVertical: 20 }} />
                <LocalizedText localizationKey={"profile_email"} style={{ color: 'white', fontSize: 20 }} />
                <Text style={{ color: 'white', fontSize: 17 }}>{this.user.email}</Text>
                <LocalizedText localizationKey={"profile_account"} style={{ color: 'white', fontSize: 20, marginTop: 10 }} />
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
                    <View style={styles.button}>
                        <LocalizedText localizationKey={"profile_button_log_out"} style={{ color: 'white' }} />
                    </View>
                </TouchableNativeFeedback>
            </View>
        )
    }
}

const styles = StyleSheet.create({
	button: { alignItems: 'center', justifyContent: 'center', backgroundColor: "#AA3C3B", paddingHorizontal: 20, borderRadius: 20, marginVertical: 20, paddingVertical: 10 },
});

export default Profile