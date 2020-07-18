import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome5';
import {PieChart} from 'react-native-svg-charts';

import {palette} from '../theme';
import {translate} from '../localization';
import {HEIGHT, WIDTH} from '../data/consts';
import {getColor, getIcon, getName} from '../data/categories';

let CircleChart = props => {
  const {monthsTotal, pieChartData, label, value} = props;

  return monthsTotal > 0 ? (
    <View style={styles.container}>
      <PieChart
        style={{height: HEIGHT * 0.5}}
        outerRadius={'90%'}
        innerRadius={'55%'}
        data={pieChartData}
      />
      <View style={[styles.itemContainer, {borderColor: getColor(label)}]}>
        <Icon
          style={styles.icon}
          size={50}
          color={getColor(label)}
          name={getIcon(label)}
        />
        <Text
          adjustsFontSizeToFit
          style={[styles.categoryText, {color: getColor(label)}]}>
          {getName(label)}
        </Text>
        <Text style={[styles.amountText, {color: getColor(label)}]}>
          {value} {this.currency}
        </Text>
      </View>
    </View>
  ) : (
    <Text style={styles.nodatatext}>
      {translate('main_monthly_summary_no_data')}{' '}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {justifyContent: 'center', flex: 1},
  nodatatext: {
    textAlign: 'center',
    color: palette.basic.white,
    fontSize: 17,
  },
  icon: {marginTop: 5},
  chartContainer: {justifyContent: 'center', flex: 1},
  itemContainer: {
    left: 350 / 2 - WIDTH * 0.2,
    position: 'absolute',
    width: WIDTH * 0.4,
    height: WIDTH * 0.4,
    borderRadius: WIDTH * 0.2,
    borderWidth: 4,
    backgroundColor: palette.basic.lightGray,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    marginTop: 5,
    textAlign: 'center',
  },
  amountText: {fontSize: 17},
});

export default CircleChart;
