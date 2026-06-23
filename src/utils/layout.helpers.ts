import {
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import React, {
  ComponentType,
  ReactNode,
  isValidElement,
  cloneElement,
  createElement,
} from 'react';
import { getPlatformShadowStyle } from './common.utils';

// Shared layout helpers used by ASRow and ASColumn. Both components apply the
// same flex/border-radius/platform overrides to their children; extracting the
// logic here keeps the two component files free of duplicated bodies while
// preserving the exact runtime behaviour of each (Row works on the horizontal
// axis, Column on the vertical axis — selected via the `axis` argument).

export type AxisDimension = 'width' | 'height';

// Derived style values both ASRow and ASColumn compute identically from their
// `style` prop. Returned as a single bundle so the two components share one
// derivation block instead of repeating it verbatim.
export interface DerivedLayoutStyle {
  flattenedStyle: ViewStyle & Record<string, unknown>;
  platformShadowStyle: ViewStyle;
  gradientColors: unknown;
  gradientStops: unknown;
  gradientStart: unknown;
  gradientEnd: unknown;
  hasGradient: boolean;
  isScrollable: boolean;
  overflowStyle: ViewStyle;
  borderRadiusStyle: ViewStyle;
}

// Compute the style-derived values shared by ASRow/ASColumn. Behaviour is
// identical to the previous inline derivation in each component: flatten the
// style, read the platform shadow, pull gradient members, decide scrollability
// (explicit `scrollable` prop OR `overflow: 'scroll'`), preserve any explicit
// overflow, and extract border-radius for the background/gradient layers.
export function deriveLayoutStyle(
  style: StyleProp<ViewStyle>,
  scrollable: boolean | undefined,
): DerivedLayoutStyle {
  const flattenedStyle: ViewStyle & Record<string, unknown> =
    StyleSheet.flatten(style);
  const platformShadowStyle = getPlatformShadowStyle(flattenedStyle);

  const {
    gradientColors: _gradientColors,
    gradientStops: _gradientStops,
    gradientStart: _gradientStart,
    gradientEnd: _gradientEnd,
  } = flattenedStyle || {};
  const hasGradient =
    Array.isArray(_gradientColors) && _gradientColors.length >= 2;

  const isScrollable =
    scrollable === true || flattenedStyle?.overflow === 'scroll';

  const overflowStyle = flattenedStyle?.overflow
    ? { overflow: flattenedStyle.overflow }
    : {};

  const borderRadiusStyle = extractBorderRadiusStyle(flattenedStyle);

  return {
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
  };
}

export function getAxisFlexOverrides(
  childStyle: ViewStyle | undefined,
  isScrollable: boolean,
): ViewStyle {
  if (isScrollable || !childStyle) return {};
  const hasFlex = childStyle.flex !== undefined && childStyle.flex !== 0;
  if (
    !hasFlex ||
    childStyle.flexBasis !== undefined ||
    childStyle.aspectRatio !== undefined
  )
    return {};
  const result: ViewStyle = {
    flexGrow: childStyle.flex ?? 0,
    flexShrink: childStyle.flexShrink ?? 1,
    flexBasis: 'auto',
    flex: undefined,
  };
  if (childStyle.minWidth === undefined) result.minWidth = 0;
  if (childStyle.minHeight === undefined) result.minHeight = 0;
  return result;
}

export function getAxisPlatformOverride(
  childStyle: ViewStyle | undefined,
  parentAlignItems: string,
  axis: AxisDimension,
): ViewStyle {
  if (Platform.OS === 'web' || !childStyle) return {};
  const value = childStyle[axis] as unknown as string | number | undefined;
  if (
    typeof value !== 'string' ||
    value === '' ||
    value === 'auto' ||
    value.endsWith('%')
  )
    return {};
  const result: ViewStyle = { [axis]: undefined };
  if (
    parentAlignItems === 'stretch' &&
    (!childStyle.alignSelf || childStyle.alignSelf === 'auto')
  ) {
    result.alignSelf = 'flex-start';
  }
  return result;
}

export function extractBorderRadiusStyle(
  style: ViewStyle | undefined,
): ViewStyle {
  if (!style) return {};
  const result: ViewStyle = {};
  if (style.borderRadius !== undefined)
    result.borderRadius = style.borderRadius;
  if (style.borderTopLeftRadius !== undefined)
    result.borderTopLeftRadius = style.borderTopLeftRadius;
  if (style.borderTopRightRadius !== undefined)
    result.borderTopRightRadius = style.borderTopRightRadius;
  if (style.borderBottomLeftRadius !== undefined)
    result.borderBottomLeftRadius = style.borderBottomLeftRadius;
  if (style.borderBottomRightRadius !== undefined)
    result.borderBottomRightRadius = style.borderBottomRightRadius;
  return result;
}

// Applies the per-child layout overrides shared by ASRow/ASColumn. `axis` is the
// dimension the container stretches children along: ASRow uses 'width' (children
// with width: '100%' become flex: 1), ASColumn uses 'height'. `defaultAlignItems`
// is the container's fallback alignItems ('center' for ASRow, 'stretch' for
// ASColumn). The behaviour is identical to the previous per-component code.
export function applyAxisChildOverrides(
  child: React.ReactNode,
  flattenedStyle: ViewStyle & Record<string, unknown>,
  isScrollable: boolean,
  axis: AxisDimension,
  defaultAlignItems: string,
): React.ReactNode {
  const fullDimension: AxisDimension = axis;
  const platformAxis: AxisDimension = axis === 'width' ? 'height' : 'width';
  if (
    isValidElement(child) &&
    !!(child.props as { style?: StyleProp<ViewStyle> })?.style
  ) {
    const childStyle = StyleSheet.flatten(
      (child.props as { style?: StyleProp<ViewStyle> })?.style,
    );
    const overrideStyle: ViewStyle = isScrollable ? { flexShrink: 0 } : {};
    Object.assign(
      overrideStyle,
      getAxisFlexOverrides(childStyle, isScrollable),
    );
    if (!isScrollable && childStyle?.[fullDimension] === '100%') {
      overrideStyle.flex = 1;
      overrideStyle[fullDimension] = undefined;
    }
    Object.assign(
      overrideStyle,
      getAxisPlatformOverride(
        childStyle,
        flattenedStyle?.alignItems ?? defaultAlignItems,
        platformAxis,
      ),
    );
    return cloneElement(
      child as React.ReactElement<{ style?: StyleProp<ViewStyle> }>,
      {
        style: [
          (child.props as { style?: StyleProp<ViewStyle> })?.style,
          overrideStyle,
        ],
      },
    );
  }
  return (
    applyContainerAxisOverride(child, isScrollable, fullDimension) ?? child
  );
}

// Applies the containerStyle height/width:'100%' -> flex:1 override for widgets
// that expose a `containerStyle` prop. Extracted from applyAxisChildOverrides to
// keep that function's cognitive complexity within limits (SonarQube S3776).
function applyContainerAxisOverride(
  child: React.ReactNode,
  isScrollable: boolean,
  fullDimension: AxisDimension,
): React.ReactNode | null {
  if (
    !isValidElement(child) ||
    !(child.props as { containerStyle?: StyleProp<ViewStyle> })?.containerStyle
  ) {
    return null;
  }
  const cStyle = StyleSheet.flatten(
    (child.props as { containerStyle?: StyleProp<ViewStyle> })?.containerStyle,
  );
  if (isScrollable || cStyle?.[fullDimension] !== '100%') {
    return null;
  }
  const containerOverride: ViewStyle =
    fullDimension === 'width'
      ? { flex: 1, width: undefined, minWidth: 0 }
      : { flex: 1, height: undefined, minHeight: 0 };
  return cloneElement(
    child as React.ReactElement<{ containerStyle?: StyleProp<ViewStyle> }>,
    {
      containerStyle: [
        (child.props as { containerStyle?: StyleProp<ViewStyle> })
          ?.containerStyle,
        containerOverride,
      ],
    },
  );
}

// ---------------------------------------------------------------------------
// Shared layout render shell (ASRow / ASColumn)
//
// The background-image + gradient decoration layers and the
// scrollable/static content wrapper are rendered identically by ASRow and
// ASColumn. They're built here once (via React.createElement, so this file
// stays a plain .ts util with no JSX) and the two components delegate to
// them, instead of repeating the same ~40-line JSX block in each file. The
// `ASImage` / `LinearGradient` components are passed in by the caller so this
// util keeps zero component-layer imports (avoiding util→component coupling
// and platform-specific gradient import differences). Runtime output is
// byte-for-byte the same tree the inline JSX produced.
// ---------------------------------------------------------------------------

const backgroundLayerStyles = StyleSheet.create({
  backgroundStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%', // Fill the entire width of the parent
    height: '100%',
    zIndex: 0,
  },
});

export interface LayoutBackgroundLayersParams {
  ASImage: ComponentType<any>;
  LinearGradient: ComponentType<any>;
  testId?: string;
  backgroundImage?: unknown;
  hasGradient: boolean;
  gradientColors: unknown;
  gradientStops: unknown;
  gradientStart: unknown;
  gradientEnd: unknown;
  borderRadiusStyle: ViewStyle;
}

// Build the background-image + gradient nodes shared by ASRow/ASColumn.
// Returns a node (fragment) suitable for placement before the content.
export function renderLayoutBackgroundLayers(
  params: LayoutBackgroundLayersParams,
): ReactNode {
  const {
    ASImage,
    LinearGradient,
    testId,
    backgroundImage,
    hasGradient,
    gradientColors,
    gradientStops,
    gradientStart,
    gradientEnd,
    borderRadiusStyle,
  } = params;

  const backgroundNode = backgroundImage
    ? createElement(ASImage, {
        testID: `${testId}-BackgroundImage`,
        source: backgroundImage,
        style: [backgroundLayerStyles.backgroundStyle, borderRadiusStyle],
        resizeMode: 'cover',
      })
    : null;

  const gradientNode = hasGradient
    ? createElement(LinearGradient, {
        colors: gradientColors,
        ...(gradientStops ? { locations: gradientStops } : {}),
        ...(gradientStart ? { start: gradientStart } : {}),
        ...(gradientEnd ? { end: gradientEnd } : {}),
        style: [StyleSheet.absoluteFillObject, borderRadiusStyle],
      })
    : null;

  return createElement(React.Fragment, null, backgroundNode, gradientNode);
}

export interface LayoutContentParams {
  isScrollable: boolean;
  testId?: string;
  horizontal: boolean;
  // Per-axis contentContainerStyle (Row/Column differ in flexDirection
  // handling). Caller computes it so this stays axis-agnostic.
  contentContainerStyle: Record<string, unknown>;
  children: ReactNode;
}

// Wrap content in a ScrollView when scrollable, else return the children
// as-is. The ScrollView config mirrors the previous inline markup exactly;
// the only per-axis differences (horizontal flag, contentContainerStyle)
// are supplied by the caller.
export function renderLayoutContent(params: LayoutContentParams): ReactNode {
  const { isScrollable, testId, horizontal, contentContainerStyle, children } =
    params;
  if (!isScrollable) return children;
  return createElement(
    ScrollView,
    {
      testID: `scrollView-${testId}`,
      horizontal,
      style: { width: '100%', height: '100%' },
      contentContainerStyle,
      showsVerticalScrollIndicator: false,
      showsHorizontalScrollIndicator: false,
      nestedScrollEnabled: true,
    },
    children,
  );
}
