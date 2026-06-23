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

export type ASColumnProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundImage?: string;
  accessibilityLabel?: string;
  spacing?: number;
  testId?: string;
  scrollable?: boolean;
  scrollDirection?: string;
};

const ASColumn: React.FC<ASColumnProps> = (props: ASColumnProps) => {
  const {
    children,
    style,
    backgroundImage,
    accessibilityLabel,
    spacing = 0,
    testId = 'ASColumn',
    scrollable,
    scrollDirection,
    ...restProps
  } = props;
  const flexValue =
    Array.isArray(children) && children.length > 0
      ? children.reduce(
          (
            acc: number | undefined,
            child: React.ReactElement<{ style?: StyleProp<ViewStyle> }>,
          ) => {
            if (!child?.props?.style) return acc; // Ensure child and its props exist
            const { flex } = StyleSheet.flatten(child.props.style);
            if (flex !== undefined && flex !== 0) return flex; // Return the first non-zero flex value found
            return acc; // Keep the previous value if none found
          },
          undefined,
        )
      : undefined;

  // Shared style derivation (flattened style, platform shadow, gradient
  // members, scrollability, overflow, border radius) — identical for
  // ASRow and ASColumn.
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
  // Also convert height: '100%' to flex: 1 for consistent behavior between CSS flex and Yoga
  const wrappedChildren = Children.map(children, (child) =>
    applyAxisChildOverrides(
      child,
      flattenedStyle,
      isScrollable,
      'height',
      'stretch',
    ),
  );

  return (
    <View
      testID={`view-${testId}`}
      style={[
        styles.container,
        { ...(flexValue && { flex: flexValue }) },
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
        backgroundImage: backgroundImage || undefined,
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
        horizontal: scrollDirection === 'horizontal',
        contentContainerStyle: {
          flexGrow: 1,
          ...(scrollDirection === 'horizontal' ? { flexDirection: 'row' } : {}),
          ...(spacing ? { gap: spacing } : {}),
        },
        children: wrappedChildren,
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'visible',
    borderColor: 'transparent',
  },
});

export default ASColumn;
