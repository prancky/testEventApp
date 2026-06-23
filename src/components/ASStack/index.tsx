import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

export type ASStackProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testId?: string;
};

const ASStack: React.FC<ASStackProps> = (props: ASStackProps) => {
  const { children, style, testId = 'ASStack' } = props;
  const flattenedStyle: ViewStyle & Record<string, unknown> =
    StyleSheet.flatten(style);
  const {
    gradientType: _gradientType,
    gradientColors: _gradientColors,
    gradientStops: _gradientStops,
    gradientStart: _gradientStart,
    gradientEnd: _gradientEnd,
  } = flattenedStyle || {};
  const hasGradient =
    Array.isArray(_gradientColors) && _gradientColors.length >= 2;

  if (hasGradient) {
    return (
      <LinearGradient
        testID={testId}
        colors={_gradientColors}
        {...(_gradientStops ? { locations: _gradientStops } : {})}
        {...(_gradientStart ? { start: _gradientStart } : {})}
        {...(_gradientEnd ? { end: _gradientEnd } : {})}
        style={[styles.container, style]}
      >
        {children}
      </LinearGradient>
    );
  }
  return (
    <View testID={testId} style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});

export default ASStack;

// NOTE:  ASStack Example
/*
            <ASStack>
                <ASImage style={{top:5}}  source={'https:i.imgur.com/oLgjoWx.png'}   roundImageSize={'30%'}   />
                 <ASText style={{bottom:20}}>Text on top</ASText>
            </ASStack>
* */
