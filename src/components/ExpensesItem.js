import React, { Component } from 'react';
import {
    View, Text, StyleSheet,
    TouchableOpacity, Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Transition } from 'react-navigation-fluid-transitions'
import { getColor, getIcon } from "../data/categories"
import { applyMoneyMask } from '../data/consts';

class ExpensesItem extends Component {
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
        const { item, history, onUpdated, currency } = this.props

        console.log("Currency", currency)
        console.log("Item Amount", item)

        const rowStyles = [
            styles.tile,
            { backgroundColor: getColor(item.key) },
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
                    <Transition shared={getIcon(item.key)}>
                        <View style={[styles.icon, { backgroundColor: getColor(item.key) }]}>
                            <Icon size={28} color={'white'} name={getIcon(item.key)} />
                        </View>
                    </Transition>
                    <Text style={{ fontSize: 16, marginTop: 5, color: 'white' }}>{applyMoneyMask(item.amount)} {currency}</Text>
                </Animated.View>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    tile: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, padding: 5 },
    icon: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'white', alignItems: 'center', justifyContent: 'center' }
});

// ExpensesItem.propTypes = {
//     item: PropTypes.object.isRequired,
//     index: PropTypes.number.isRequired,
//     onPress: PropTypes.func.isRequired,
//     navigation: PropTypes.object.isRequired,
//     currency: PropTypes.string.isRequired,
//     history: PropTypes.array.isRequired,
//     onUpdated: PropTypes.func.isRequired
// }

export default ExpensesItem;