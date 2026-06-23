import React from 'react';
import {
  ColorValue,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import ASText from '../ASText';

export type ASProgressBarProps = {
  progressBarTitle?: string;
  progressValue: number;
  progressCurrentStyle?: StyleProp<ViewStyle>;
  progressTitleTypography?: StyleProp<TextStyle>;
  progressTitleStyle?: StyleProp<TextStyle>;
  progressBarStyle?: StyleProp<ViewStyle>;
  activeColor?: ColorValue;
  inActiveColor?: ColorValue;
  style?: StyleProp<ViewStyle>;
  testId?: string;
};

const ASProgressBar: React.FC<ASProgressBarProps> = (
  props: ASProgressBarProps,
) => {
  const {
    progressBarTitle,
    progressValue,
    progressCurrentStyle,
    progressTitleTypography,
    progressTitleStyle,
    progressBarStyle,
    activeColor,
    inActiveColor,
    style,
    testId = 'ASProgressBar',
  } = props;

  return (
    <View
      testId={`${testId}`}
      style={[styles.progressBarContainer, StyleSheet.flatten(style)]}
    >
      {!!progressBarTitle && (
        <ASText
          testID={`title-${testId}`}
          style={[
            styles.progressBarText,
            progressTitleTypography,
            progressTitleStyle,
          ]}
        >
          {progressBarTitle}
        </ASText>
      )}
      <View
        testID={`progressBarView-${testId}`}
        style={[
          progressBarStyle,
          { backgroundColor: inActiveColor, overflow: 'hidden' },
        ]}
      >
        <View
          testID={`currentProgressBarView-${testId}`}
          style={[
            progressCurrentStyle,
            { backgroundColor: activeColor },
            {
              width: `${(progressValue / 100) * 100}%`,
              borderRadius: progressBarStyle?.borderRadius,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    justifyContent: 'center',
  },
  progressBarText: {
    paddingBottom: 4,
  },
});

export default ASProgressBar;
