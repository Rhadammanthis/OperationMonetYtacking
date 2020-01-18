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