import React, { Component } from 'react';
import {
    AsyncStorage, StyleSheet,
    TouchableNativeFeedback,
    View, Text,
    Image,
    FlatList,
    Animated
} from 'react-native';
import { StackActions } from "react-navigation";
import LocalizedText from '../components/LocalizedText';
import * as Data from '../data/countries'
import { WIDTH, SPENDLESS_LIGHT_BLUE_ALPHA, SPENDLESS_LIGHT_BLUE, SPENDLESS_BLUE, HEIGHT } from '../data/consts';

class Currency extends Component {
    constructor(props) {
        super(props)
        //161943 H&K
        this.state = { selectedCountry: {}, animCloseButton: new Animated.Value(0) }
    }

    componentDidMount() {


    }

    Item = ({ country }) => {

        const { selectedCountry } = this.state

        const springAnimation = Animated.spring(this.state.animCloseButton, {
            toValue: 1,
            duration: 200,
            friction: 8,
            tension: 50,
            useNativeDriver: true
        })

        const selected = { backgroundColor: SPENDLESS_LIGHT_BLUE_ALPHA }

        return (
            <TouchableNativeFeedback onPress={(ev) => { this.setState({ selectedCountry: country }); springAnimation.start() }} style={{ position: 'absolute' }} >
                <View style={[styles.countryContainer, country.id === selectedCountry.id ? selected : {}]}>
                    <Image style={{ width: 40, height: 40 }} source={country.image} />
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginHorizontal: 15 }}>
                        <Text style={{ color: 'black', fontSize: 16, textAlign: 'center' }}>{country.currency_name}</Text>
                    </View>
                    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'flex-end' }}>
                        <Text style={{ color: 'black', fontSize: 17, textAlign: 'center' }}>{country.symbol}</Text>
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
                <Animated.View style={[styles.button, {
                    transform: [{
                        translateY: animCloseButton.interpolate({
                            inputRange: [0, 1],
                            outputRange: [300, 20]
                        })
                    }]
                }]}>
                    <LocalizedText localizationKey={"currency_button"} style={{ color: 'white' }} />
                </Animated.View>
            </TouchableNativeFeedback>
        )
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: SPENDLESS_BLUE, alignItems: 'center' }}>
                <LocalizedText localizationKey={"currency_message"} style={styles.title} />
                <View style={styles.listContainer}>
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

const styles = StyleSheet.create({
    listContainer: { height: HEIGHT * 0.5, backgroundColor: 'white', borderRadius: 10, marginBottom: 15 },
    title: { color: 'white', textAlign: 'center', fontSize: 25, maxWidth: WIDTH * 0.75, marginVertical: 25 },
    countryContainer: { paddingHorizontal: 10, paddingVertical: 15, flexDirection: 'row', width: WIDTH * 0.75 },
    button: { alignItems: 'center', justifyContent: 'center', backgroundColor: SPENDLESS_LIGHT_BLUE, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }
});

export default Currency