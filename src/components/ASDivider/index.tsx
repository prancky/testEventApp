import React from 'react';
import {
  DimensionValue,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

export type ASDividerProps = {
  style?: StyleProp<ViewStyle>;
  marginVertical?: DimensionValue;
  width?: DimensionValue;
  testId?: string;
};

const ASDivider: React.FC<ASDividerProps> = (props: ASDividerProps) => {
  const { style, marginVertical, width, testId = 'ASDivider' } = props;

  return <View testID={testId} style={[{ marginVertical, width }, style]} />;
};

const styles = StyleSheet.create({});

export default ASDivider;
