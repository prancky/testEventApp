import React, { ReactNode, Children } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import {
  applyAxisChildOverrides,
  deriveLayoutStyle,
  renderLayoutBackgroundLayers,
  renderLayoutContent,
} from '../../utils/layout.helpers';
import ASImage from '../ASImage';

import LinearGradient from 'react-native-linear-gradient';

export type ASRowProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  spacing?: number;
  testId?: string;
  backgroundImage?: string | number | { uri: string };
};

const ASRow: React.FC<ASRowProps> = (props: ASRowProps) => {
  const {
    children,
    style,
    accessibilityLabel,
    spacing,
    testId = 'ASRow',
    backgroundImage,
    scrollable,
    scrollDirection,
    ...restProps
  } = props || {};

  // Shared style derivation (flattened style, platform shadow, gradient members,
  // scrollability, overflow, border radius) — identical for ASRow and ASColumn.
  const {
    flattenedStyle,
    platformShadowStyle,
    gradientColors: _gradientColors,
    gradientStops: _gradientStops,
    gradientStart: _gradientStart,
    gradientEnd: _gradientEnd,
    hasGradient,
    isScrollable,
    overflowStyle,
    borderRadiusStyle,
  } = deriveLayoutStyle(style, scrollable);

  // Wrap children with layout overrides:
  // - Scrollable: flexShrink: 0 so children keep natural size for scrolling
  // - Non-scrollable: minWidth/minHeight: 0 to support proper flexbox shrinking
  const wrappedChildren = Children.map(children, (child) =>
    applyAxisChildOverrides(
      child,
      flattenedStyle,
      isScrollable,
      'width',
      'center',
    ),
  );

  return (
    <View
      testID={testId}
      style={[
        styles.container,
        style,
        platformShadowStyle,
        { ...(spacing && { gap: spacing }) },
        overflowStyle,
      ]}
      accessibilityLabel={accessibilityLabel}
      {...restProps}
    >
      {renderLayoutBackgroundLayers({
        ASImage,
        LinearGradient,
        testId,
        backgroundImage,
        hasGradient,
        gradientColors: _gradientColors,
        gradientStops: _gradientStops,
        gradientStart: _gradientStart,
        gradientEnd: _gradientEnd,
        borderRadiusStyle,
      })}
      {renderLayoutContent({
        isScrollable,
        testId,
        horizontal: scrollDirection !== 'vertical',
        contentContainerStyle: {
          flexGrow: 1,
          flexDirection: scrollDirection === 'vertical' ? 'column' : 'row',
          ...(spacing ? { gap: spacing } : {}),
        },
        children: wrappedChildren,
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'transparent',
  },
});

export default ASRow;

// Note: ASRow Example
/*
                <ASRow>
                    <ASText style={{textAlign: 'center'}}>Welcome to App Studio</ASText>
                    <ASVerticalDivider/>
                    <ASText style={{color: 'red'}}>Testing component</ASText>
                </ASRow>
* */
