import React, { isValidElement, Children, cloneElement } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import ASText from '../ASText';
import { getPlatformShadowStyle } from '../../utils/common.utils';

export type ASBadgeProps = {
  children: React.ReactNode;
  label: number | string | null | undefined;
  badgeStyles?: StyleProp<ViewStyle>;
  badgeTextStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  id?: string;
  testId?: string;
};

const ASBadge: React.FC<ASBadgeProps> = (props: ASBadgeProps) => {
  const {
    children,
    testId = 'ASBadge',
    label,
    badgeStyles,
    badgeTextStyle,
    containerStyle,
    id,
    ...restProps
  } = props;

  // Get platform-specific shadow style from flattened style
  const flattenedStyle = StyleSheet.flatten(containerStyle);
  const platformShadowStyle = getPlatformShadowStyle(flattenedStyle);

  // Extract overflow property to apply later (to override default 'visible')
  const overflowStyle = flattenedStyle?.overflow
    ? { overflow: flattenedStyle.overflow }
    : {};

  const hasChildren = Children.count(children) > 0;

  // Wrap children with minWidth: 0 and minHeight: 0 to support proper flexbox shrinking
  // Also convert height: '100%' to flex: 1 for consistent behavior between CSS flex and Yoga
  const wrappedChildren = Children.map(children, (child) => {
    if (
      isValidElement<{ style?: StyleProp<ViewStyle> }>(child) &&
      !!child.props?.style
    ) {
      const childStyle = StyleSheet.flatten(child.props?.style);
      const overrideStyle: ViewStyle = { minWidth: 0, minHeight: 0 };
      if (childStyle?.height === '100%') {
        overrideStyle.flex = 1;
        overrideStyle.height = undefined;
      }
      return cloneElement(
        child as React.ReactElement<{ style?: StyleProp<ViewStyle> }>,
        {
          style: [child.props?.style, overrideStyle],
        },
      );
    }
    return child;
  });

  // Standalone badge (no children): render as a pill/chip
  if (!hasChildren && !!label) {
    const { borderRadius, minWidth, minHeight } = flattenedStyle || {};
    const inheritedBadgeStyle: ViewStyle = {};
    if (borderRadius !== undefined)
      inheritedBadgeStyle.borderRadius = borderRadius;
    if (minWidth !== undefined) inheritedBadgeStyle.minWidth = minWidth;
    if (minHeight !== undefined) inheritedBadgeStyle.minHeight = minHeight;

    return (
      <View
        style={[
          styles.standaloneBadge,
          inheritedBadgeStyle,
          badgeStyles,
          platformShadowStyle,
          overflowStyle,
        ]}
        id={id}
        testID={`view-${testId}`}
        {...restProps}
      >
        <ASText
          testID={`badgeLabel-${testId}`}
          style={[styles.badgeTextStyle, badgeTextStyle]}
        >
          {label}
        </ASText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        platformShadowStyle,
        overflowStyle,
      ]}
      id={id}
      testID={`view-${testId}`}
      {...restProps}
    >
      {wrappedChildren}
      {!!label && (
        <View
          testID={`badgeView-${testId}`}
          style={[styles.badgeStyles, badgeStyles]}
        >
          <ASText
            testID={`badgeLabel-${testId}`}
            style={[styles.badgeTextStyle, badgeTextStyle]}
          >
            {label}
          </ASText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flexShrink: 1,
    borderColor: 'transparent',
  },
  standaloneBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeStyles: {
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    right: 0,
    position: 'absolute',
  },
  badgeTextStyle: {
    fontWeight: 'bold',
  },
});

export default ASBadge;

// Note: ASBadge example
/*
                <ASBadge badgeNumber={3}>
                    <ASRow>
                        <ASText>Badge</ASText>
                        <Icon name="user-circle-o" size={30} color="theme.colors.primary"/>
                    </ASRow>
                </ASBadge>
* */
