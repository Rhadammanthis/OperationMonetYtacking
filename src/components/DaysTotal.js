import React from 'react';
import {StyleSheet, View} from 'react-native';

import LocalizedText from '../components/LocalizedText';

import {palette} from '../theme';
import {applyMoneyMask, WIDTH} from '../data/consts';

let DaysTotal = props => {
  const {total, currency} = props;

  return (
    <View style={[styles.container, {width: WIDTH}]}>
      {total ? (
        <LocalizedText localizationKey={'main_day_total'} style={styles.text}>
          {applyMoneyMask(total)} {currency}
        </LocalizedText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {color: palette.basic.white, fontWeight: 'bold', fontSize: 17},
  container: {
    backgroundColor: palette.spendless.blue,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    position: 'absolute',
    bottom: 0,
  },
});

export default DaysTotal;
