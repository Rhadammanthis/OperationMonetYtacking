import { Dimensions } from 'react-native';

//Global values for the screen's width and height
export const WIDTH = Dimensions.get('window').width
export const HEIGHT = Dimensions.get('window').height

//Values that depend on the screen's height
export const calendarDayTextSize = Dimensions.get('window').height < 600 ? 14 : 15
export const calendarMonthTextSize = Dimensions.get('window').height < 600 ? 20 : 30
export const panelOffset = (Dimensions.get('window').height * -0.27)

//App style values
export const SPENDLESS_BLUE = '#005577'
export const SPENDLESS_LIGHT_BLUE = 'rgba(0, 173, 245, 1)'
export const SPENDLESS_LIGHT_BLUE_ALPHA = 'rgba(0, 173, 245, 0.25)'

//To add the little comma that goes with money text
String.prototype.insert = function (idx, rem, str) {
	return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

export const applyMoneyMask = (quantity) => {

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