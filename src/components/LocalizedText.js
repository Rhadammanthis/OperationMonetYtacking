import React, {Component} from 'react';
import {Text} from 'react-native';
import PropTypes from 'prop-types';
import {translate} from '../localization';

class LocalizedText extends Component {
  render() {
    return (
      <Text {...this.props} adjustsFontSizeToFit style={this.props.style}>
        {translate(this.props.localizationKey)} {this.props.children}
      </Text>
    );
  }
}

LocalizedText.propTypes = {
  localizationKey: PropTypes.any.isRequired,
};

export default LocalizedText;
