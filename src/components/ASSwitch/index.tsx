import React, { useContext } from 'react';
import {
  StyleSheet,
  StyleProp,
  Switch,
  SwitchProps,
  View,
  ViewStyle,
} from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { getPlatformShadowStyle } from '../../utils/common.utils';

export type ASSwitchProps = SwitchProps & {
  enableThumbColor?: string;
  disabledThumbColor?: string;
  enableTrackColor?: string;
  disabledTrackColor?: string;
  onChange: (value: boolean) => void;
  activeThumbColor?: string;
  testId?: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

const ASSwitch: React.FC<ASSwitchProps> = (props: ASSwitchProps) => {
  useContext(ThemeContext);
  const {
    enableThumbColor,
    disabledThumbColor,
    onChange,
    enableTrackColor,
    disabledTrackColor,
    testId = 'ASSwitch',
    style,
    containerStyle,
    disabled,
    value,
    ...restProps
  } = props;

  // Extract shadow styles from containerStyle
  const flattenedStyle: ViewStyle & { shadowSpread?: number } =
    StyleSheet.flatten(containerStyle) || {};
  const {
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    shadowSpread,
    elevation,
    ...nonShadowContainerStyle
  } = flattenedStyle;

  // Get platform-specific shadow style from extracted shadow properties
  const platformShadowStyle = getPlatformShadowStyle({
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    shadowSpread,
  });

  const toggleSwitch = () => {
    onChange?.(!value);
  };

  const getTrackColor = () => {
    return { true: enableTrackColor, false: disabledTrackColor };
  };

  const getThumbColor = () => {
    return value ? enableThumbColor : disabledThumbColor;
  };

  return (
    <View style={[style, nonShadowContainerStyle]}>
      <Switch
        testID={testId}
        trackColor={getTrackColor()}
        ios_backgroundColor={disabledTrackColor}
        onValueChange={toggleSwitch}
        value={value}
        thumbColor={getThumbColor()}
        activeThumbColor={enableThumbColor}
        style={{ alignSelf: 'flex-start', ...platformShadowStyle }}
        disabled={disabled}
        {...restProps}
      />
    </View>
  );
};

export default ASSwitch;
