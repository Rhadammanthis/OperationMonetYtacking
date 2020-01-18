import React, { Component } from 'react'
import { Text } from 'react-native'
import { translate } from "../localization"
import PropTypes from 'prop-types'

class LocalizedText extends Component{
    render() {
        return <Text {...this.props} style={this.props.style}>{translate(this.props.localizationKey)}</Text>;
      }
}

LocalizedText.propTypes = {
    localizationKey: PropTypes.any.isRequired
}

export default LocalizedText