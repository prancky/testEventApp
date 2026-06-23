import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export type ASVerticalDividerProps = {
  style?: StyleProp<ViewStyle>;
  testId?: string;
};

const ASVerticalDivider: React.FC<ASVerticalDividerProps> = (
  props: ASVerticalDividerProps,
) => {
  const { style, testId = 'ASVerticalDivider' } = props;

  return <View testID={testId} style={style} />;
};

const styles = StyleSheet.create({});

export default ASVerticalDivider;
