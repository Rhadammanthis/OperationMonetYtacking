import React, { Component } from 'react';
import {
    StyleSheet,
    View, Text,
    StatusBar,
    BackHandler, TouchableNativeFeedback,
    TouchableOpacity, Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Transition } from 'react-navigation-fluid-transitions'
import { applyMoneyMask, SPENDLESS_BLUE } from '../data/consts';
import { getColor, getIcon, getName } from '../data/categories';
import LocalizedText from '../components/LocalizedText';


class History extends Component {
    constructor(props) {
        super(props)

        const { navigation } = this.props
        this.category = navigation.getParam('cat', 'vgt')

        this.history = navigation.getParam('history', null)
        this.amount = this.props.navigation.getParam('amount', null)
        this.currency = this.props.navigation.getParam('currency', null)

        this._animated = new Animated.Value(0)

        todaysDate = new Date(this.history[0].date).toLocaleDateString()

        state = { history: this.history }
        console.log(this.history)
    }

    componentDidMount() {
        StatusBar.setBackgroundColor(getColor(this.category), true)

        BackHandler.addEventListener('hardwareBackPress', () => {
            StatusBar.setBackgroundColor(SPENDLESS_BLUE, true)
        })

    }

    _renderHistory = () => {
        if (this.history.length === 0) {
            StatusBar.setBackgroundColor(SPENDLESS_BLUE, true)
            return this.props.navigation.goBack();
        }

        let items = this.history.map((item, i) => {

            let animated = new Animated.Value(0)
            let interpolatedValue = animated.interpolate({
                inputRange: [0, 1],
                outputRange: [40, -5]
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }} key={i}>
                    <TouchableNativeFeedback onPress={() => { animation.start(); setTimeout(() => { reverseAnimation.start() }, 2000) }}>
                        <View style={{ flexDirection: 'row', marginHorizontal: 10, flex: 1, paddingVertical: 5 }}>
                            <Text style={{ fontSize: 20, color: 'black' }}>{applyMoneyMask(item.amount)} {this.currency}</Text>
                            <View style={{ flex: 1 }} />
                            <Text style={{ fontSize: 15, textAlignVertical: 'center' }}>{new Date(item.date).toLocaleTimeString()}</Text>
                        </View>
                    </TouchableNativeFeedback>
                    <Animated.View style={[styles.deleteButton, { transform: [{ translateX: interpolatedValue }] }]}>
                        <TouchableNativeFeedback onPress={(evt) => {
                            this.amount -= item.amount
                            this.history.splice(i, 1)
                            this.setState({ history: this.history })

                            this.props.navigation.state.params.onUpdated(this.category,
                                this.amount);
                        }}>
                            <Icon color={'white'} size={20} name="times-circle" />
                        </TouchableNativeFeedback>
                    </Animated.View>
                </View>
            )
        })

        return items
    }

    render() {
        return (
            <View style={{ flex: 1, flexDirection: 'column', backgroundColor: getColor(this.category) }}>
                <View style={{ flexDirection: 'column', padding: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <Animated.View style={[styles.icon, { backgroundColor: getColor(this.category) }]}>
                        <Icon size={55} color={'white'} name={getIcon(this.category)} />
                    </Animated.View>
                    <Text style={{ color: 'white', fontSize: 30, textAlign: 'center' }}>{getName(this.category)}</Text>
                    <Text style={{ color: 'white', fontSize: 20, marginTop: 10, textAlign: 'center' }}>{todaysDate}</Text>
                </View>
                <View style={{ marginHorizontal: 10, marginBottom: 10, flex: 1, borderRadius: 20, backgroundColor: '#EEE' }}>
                    <View style={{ flexDirection: 'row', margin: 10 }}>
                        <LocalizedText localizationKey={"history_amount"} style={{ fontSize: 25, color: 'black' }} />
                        <View style={{ flex: 1 }} />
                        <LocalizedText localizationKey={"history_time"} style={{ fontSize: 25 }} />
                    </View>
                    {this._renderHistory()}
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    icon: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center' },
    deleteButton: { alignItems: 'center', justifyContent: 'center', height: 30, width: 30, borderRadius: 15, backgroundColor: '#AA3C3B' }
});

export default History