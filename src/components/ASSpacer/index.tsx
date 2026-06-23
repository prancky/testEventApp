import React from 'react';
import {
  DimensionValue,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { convertPercentageToPx } from '../../utils/common.utils';

export type ASSpacerProps = {
  style?: StyleProp<ViewStyle>;
  width?: DimensionValue;
  height?: DimensionValue;
  testId?: string;
};

const ASSpacer: React.FC<ASSpacerProps> = (props: ASSpacerProps) => {
  const { style, testId = 'ASSpacer', ...restProps } = props || {};
  // ASSpacer must use number instead of string percentage ("50%") that will cause scroll view unable to scroll
  const heightValue = convertPercentageToPx(style?.height, false);
  const widthValue = convertPercentageToPx(style?.width, true);

  return (
    <View
      testID={testId}
      style={[style, { width: widthValue, height: heightValue }]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({});

export default ASSpacer;
