import React, { ReactNode } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { toNumber } from '../../utils/common.utils';

import LinearGradient from 'react-native-linear-gradient';

type HeaderRoute = {
  name?: string;
  params?: {
    headerShown?: boolean;
  };
};

type ScrollableContentProps = {
  children: ReactNode;
  testId: string;
  scrollViewProps?: ScrollViewProps;
  scrollViewContentContainerStyle?: StyleProp<ViewStyle>;
  alignmentStyle: object | undefined;
  scrollPaddingStyle: object | undefined;
};

function renderScrollableContent({
  children,
  testId,
  scrollViewProps,
  scrollViewContentContainerStyle,
  alignmentStyle,
  scrollPaddingStyle,
}: ScrollableContentProps): React.ReactElement {
  const absoluteChildren: React.ReactNode[] = [];
  const flowChildren: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const childStyle = StyleSheet.flatten(
        (child as React.ReactElement<{ style?: StyleProp<ViewStyle> }>).props
          ?.style,
      );
      if (childStyle?.position === 'absolute') {
        absoluteChildren.push(child);
        return;
      }
    }
    flowChildren.push(child);
  });
  return (
    <>
      {absoluteChildren}
      <ScrollView
        testID={`scrollView-${testId}`}
        style={styles.scrollViewOuterStyle}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        {...scrollViewProps}
        contentContainerStyle={[
          styles.scrollViewStyle,
          alignmentStyle,
          scrollPaddingStyle,
          scrollViewContentContainerStyle,
        ]}
      >
        {flowChildren}
      </ScrollView>
    </>
  );
}

type EdgeInsets = { top: number; bottom: number; left: number; right: number };
type SafeAreaPadding = {
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
};
type FlatViewStyle = (ViewStyle & Record<string, unknown>) | undefined;

function computeHasHeader(
  isPreview: boolean,
  navigation: ReturnType<typeof useNavigation>,
  route: ReturnType<typeof useRoute>,
): boolean | undefined {
  if (isPreview) return undefined;
  return navigation
    ?.getParent?.()
    ?.getState()
    ?.routes?.some(
      (r: HeaderRoute) =>
        r.name === route.name && r.params?.headerShown !== false,
    );
}

function computeSafeAreaStyle(
  disabledSafeArea: boolean | undefined,
  isHeaderVisible: boolean,
  flattenedStyle: FlatViewStyle,
  insets: EdgeInsets,
): SafeAreaPadding {
  if (disabledSafeArea) return {};
  const padTop = toNumber(flattenedStyle?.paddingTop) ?? 0;
  return {
    paddingTop: isHeaderVisible
      ? Math.max(padTop, insets.top, 0)
      : padTop + insets.top,
    paddingBottom:
      (toNumber(flattenedStyle?.paddingBottom) ?? 0) + insets.bottom,
    paddingLeft: (toNumber(flattenedStyle?.paddingLeft) ?? 0) + insets.left,
    paddingRight: (toNumber(flattenedStyle?.paddingRight) ?? 0) + insets.right,
  };
}

function computeScrollPaddingStyle(
  isScrollable: boolean | undefined,
  safeAreaStyle: SafeAreaPadding,
  flattenedStyle: FlatViewStyle,
): SafeAreaPadding | undefined {
  if (!isScrollable) return undefined;
  return {
    paddingTop:
      safeAreaStyle.paddingTop ?? toNumber(flattenedStyle?.paddingTop) ?? 0,
    paddingBottom:
      safeAreaStyle.paddingBottom ??
      toNumber(flattenedStyle?.paddingBottom) ??
      0,
    paddingLeft:
      safeAreaStyle.paddingLeft ?? toNumber(flattenedStyle?.paddingLeft) ?? 0,
    paddingRight:
      safeAreaStyle.paddingRight ?? toNumber(flattenedStyle?.paddingRight) ?? 0,
  };
}

export type ASContainerProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  isScrollable?: boolean;
  scrollViewContentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: ScrollViewProps;
  disabledSafeArea?: boolean;
  isPreview?: boolean;
  testId?: string;
};

const ASContainer: React.FC<ASContainerProps> = (props: ASContainerProps) => {
  const {
    children,
    style,
    isScrollable,
    scrollViewContentContainerStyle,
    scrollViewProps,
    disabledSafeArea,
    isPreview = false,
    testId = 'ASContainer',
    ...restProps
  } = props;

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  const effectiveInsets = disabledSafeArea
    ? { top: 0, bottom: 0, left: 0, right: 0 }
    : insets;

  const hasHeader = computeHasHeader(isPreview, navigation, route);
  const isHeaderVisible = hasHeader === undefined;

  const flattenedStyle: ViewStyle & Record<string, unknown> =
    StyleSheet.flatten(style);

  // Extract gradient properties from style
  const {
    gradientType: _gradientType,
    gradientColors: _gradientColors,
    gradientStops: _gradientStops,
    gradientStart: _gradientStart,
    gradientEnd: _gradientEnd,
  } = flattenedStyle || {};
  const hasGradient =
    Array.isArray(_gradientColors) && _gradientColors.length >= 2;

  const safeAreaStyle = computeSafeAreaStyle(
    disabledSafeArea,
    isHeaderVisible,
    flattenedStyle,
    effectiveInsets,
  );

  // Pass container alignment properties through to ScrollView's contentContainerStyle
  // so the ScrollView acts as a transparent layer (designer has no ScrollView)
  const alignmentStyle = isScrollable
    ? {
        alignItems: flattenedStyle?.alignItems,
        justifyContent: flattenedStyle?.justifyContent,
        alignContent: flattenedStyle?.alignContent,
      }
    : undefined;

  // Move all padding into ScrollView content so:
  // 1. Absolute children reference the full container height for percentage positioning
  // 2. Child box-shadows are not clipped by ScrollView's overflow on web
  const scrollPaddingStyle = computeScrollPaddingStyle(
    isScrollable,
    safeAreaStyle,
    flattenedStyle,
  );
  const outerStyleOverride = isScrollable
    ? {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
      }
    : undefined;

  const content = isScrollable
    ? renderScrollableContent({
        children,
        testId,
        scrollViewProps,
        scrollViewContentContainerStyle,
        alignmentStyle,
        scrollPaddingStyle,
      })
    : children;

  if (hasGradient) {
    return (
      <LinearGradient
        testID={testId}
        colors={_gradientColors}
        {...(_gradientStops ? { locations: _gradientStops } : {})}
        {...(_gradientStart ? { start: _gradientStart } : {})}
        {...(_gradientEnd ? { end: _gradientEnd } : {})}
        {...restProps}
        style={[styles.container, style]}
      >
        {content}
      </LinearGradient>
    );
  }

  return (
    <View
      testID={testId}
      {...restProps}
      style={[styles.container, style, safeAreaStyle, outerStyleOverride]}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'visible',
    borderColor: 'transparent',
  },
  scrollViewOuterStyle: {
    flex: 1,
    alignSelf: 'stretch',
  },
  scrollViewStyle: {
    flexGrow: 1,
    overflow: 'visible',
  },
});

export default ASContainer;
