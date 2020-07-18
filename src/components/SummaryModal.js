import React, {useState, useMemo, useEffect} from 'react';
import {View, Text, StyleSheet, LayoutAnimation} from 'react-native';

import Modal from 'react-native-modalbox';
import LocalizedText from '../components/LocalizedText';
import {getColor} from '../data/categories';

import {palette} from '../theme';
import {translate} from '../localization';
import {applyMoneyMask, HEIGHT} from '../data/consts';
import CircleChart from './CircleChart';

let SummaryModal = props => {
  const {monthTotal, show, categoriesTotal, onClose, currency} = props;

  let slice = useMemo(() => {
    let initialCat = Object.keys(categoriesTotal)[0];
    return {
      value: applyMoneyMask(categoriesTotal[initialCat]),
      label: initialCat,
    };
  }, [categoriesTotal]);

  const [selectedSlice, setSelectedSlice] = useState(slice);

  useEffect(() => {
    setSelectedSlice(slice);
  }, [slice]);

  const pieChartData = Object.keys(categoriesTotal).map(key => {
    return {
      key,
      value: categoriesTotal[key],
      svg: {fill: getColor(key)},
      arc: {
        outerRadius: '90%',
        padAngle: selectedSlice.label === key ? 0.05 : 0,
      },
      onPress: () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        setSelectedSlice({
          label: key,
          value: applyMoneyMask(categoriesTotal[key]),
        });
      },
    };
  });

  return (
    <Modal
      style={styles.container}
      onClosed={() => {
        onClose();
      }}
      position={'center'}
      isOpen={show}
      animationDuration={350}
      swipeToClose={false}>
      <LocalizedText
        localizationKey={'main_monthly_summary_title'}
        style={styles.title}
      />
      <View style={styles.chartContainer}>
        {
          <CircleChart
            monthsTotal={monthTotal}
            pieChartData={pieChartData}
            label={selectedSlice.label}
            value={selectedSlice.value}
          />
        }
      </View>
      <Text style={styles.monthlySumText}>
        {translate('main_monthly_summary_total')} {applyMoneyMask(monthTotal)}{' '}
        {currency}
      </Text>
    </Modal>
  );
};

const styles = StyleSheet.create({
  monthlySumText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    color: palette.basic.white,
    backgroundColor: palette.spendless.blue,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  chartContainer: {justifyContent: 'center', flex: 1},
  title: {
    textAlign: 'center',
    paddingLeft: 10,
    fontSize: 25,
    color: palette.basic.white,
    paddingVertical: 10,
  },
  container: {
    height: HEIGHT * 0.6,
    width: 350,
    borderRadius: 10,
    backgroundColor: palette.spendless.blue,
  },
});

export default SummaryModal;
