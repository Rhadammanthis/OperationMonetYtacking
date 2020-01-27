import React, { Component } from 'react';
import {
    StyleSheet,
    View, Text,
    StatusBar,
    BackHandler,
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
            return (
                <TouchableOpacity key={i} onPress={(event) => {
                    this.amount -= item.amount
                    this.history.splice(i, 1)
                    this.setState({ history: this.history })

                    this.props.navigation.state.params.onUpdated(this.category,
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
            <View style={{ flex: 1, flexDirection: 'column', backgroundColor: getColor(this.category) }}>
                <View style={{ flexDirection: 'row', padding: 20 }}>
                    <Transition shared={getIcon(this.category)}>
                        <Animated.View style={[styles.icon, { backgroundColor: getColor(this.category) }]}>
                            <Icon size={35} color={'white'} name={getIcon(this.category)} />
                        </Animated.View>
                    </Transition>
                    <View style={{ flex: 1, justifyContent: 'flex-start', marginLeft: 20 }}>
                        <Text style={{ color: 'white', fontSize: 30 }}>{getName(this.category)}</Text>
                        <Text style={{ color: 'white', fontSize: 20, marginTop: 20 }}>{todaysDate}</Text>
                    </View>
                </View>

                <View style={{ marginHorizontal: 10, marginBottom: 10, flex: 1, borderRadius: 20, backgroundColor: 'white' }}>
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
    icon: { width: 60, height: 60, borderRadius: 35, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center' },
});

export default History