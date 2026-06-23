import React, { Children, ReactNode } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import ASText from '../ASText';
import ASImage from '../ASImage';
import CustomIcon from '../CustomIcon';

import LinearGradient from 'react-native-linear-gradient';

/**
 * ASAppBar — three-slot, props-driven app bar widget.
 *
 *   leading slot               centre slot               trailing slot
 *   ────────────               ───────────               ─────────────
 *   FIXED shape:               Auto title (default) OR   Custom — any child
 *   container + back icon.     a custom child widget.    widgets are stacked
 *   User customises icon       Title text + subtitle +   here. row/column via
 *   (name/color/size) and      titleLeadingIcon when     `actionsLayout`.
 *   the container style.       auto, or any child when
 *   No child injection.        centerMode === 'custom'.
 *
 * Children-to-slot routing is POSITIONAL (no name lookup, no leading custom):
 *   - centerMode === 'custom'  → consume the FIRST child.
 *   - Everything else flows into trailing.
 *
 * Container styling: each of the three slot wrappers accepts an independent
 * style group (`leadingContainerStyle`, `centerContainerStyle`,
 * `trailingContainerStyle`) so authors can paint backgrounds, borders,
 * padding etc. on individual slots without touching the bar-level `style`.
 *
 * Background paint mirrors ASContainer/ASRow: solid via style.backgroundColor,
 * gradient via the style group (gradientColors/Stops/Start/End/Type), image
 * via the top-level `backgroundImage` property. The bar honours all three
 * simultaneously when set.
 */

export type ASAppBarVariant = 'default' | 'large' | 'transparent';
export type ASAppBarSlotMode = 'auto' | 'custom';
export type ASAppBarAlignment = 'left' | 'center' | 'right';
export type ASAppBarActionsLayout = 'row' | 'column';
export type ASAppBarBottomShape = 'flat' | 'rounded';

export type ASAppBarProps = {
  // ── Leading slot (FIXED: container + back icon, no custom view) ───────
  leadingShow?: boolean; // default true
  leadingIcon?: string; // material icon name; default 'arrow_back'
  leadingIconColor?: string; // takes priority over backIconColor
  leadingIconSize?: number; // takes priority over backIconSize
  backIconColor?: string; // alias from widget library defaults
  backIconSize?: number; // alias from widget library defaults
  leadingContainerStyle?: StyleProp<ViewStyle>;
  onPressBackButton?: () => void;
  // ── Centre slot ──────────────────────────────────────────────────────
  centerShow?: boolean; // default true
  centerMode?: ASAppBarSlotMode; // default 'auto'
  title?: string;
  subtitle?: string;
  titleLeadingIcon?: string; // inline material icon before title
  centerAlignment?: ASAppBarAlignment; // default 'left'
  centerContainerStyle?: StyleProp<ViewStyle>;
  // ── Trailing slot ────────────────────────────────────────────────────
  trailingShow?: boolean; // default true
  actionsLayout?: ASAppBarActionsLayout; // default 'row'
  trailingContainerStyle?: StyleProp<ViewStyle>;
  // ── Variant + background ─────────────────────────────────────────────
  variant?: ASAppBarVariant;
  backgroundImage?: string | number | { uri: string };
  backgroundImageResizeMode?:
    | 'cover'
    | 'contain'
    | 'stretch'
    | 'repeat'
    | 'center';
  // ── Bottom edge shape ────────────────────────────────────────────────
  bottomShape?: ASAppBarBottomShape;
  bottomShapeRadius?: number;
  bottomShapeColor?: string; // color of the arch decoration; must match the content area background
  // ── Style groups (bar-level + title/subtitle text) ───────────────────
  style?: StyleProp<ViewStyle>;
  textStyles?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  // ── Misc ─────────────────────────────────────────────────────────────
  isPreviewScreen?: boolean;
  testId?: string;
  children?: ReactNode;
};

function extractBorderRadiusStyle(
  flatStyle: (ViewStyle & Record<string, unknown>) | undefined,
): ViewStyle {
  const r: ViewStyle = {};
  if (flatStyle?.borderRadius !== undefined)
    r.borderRadius = flatStyle.borderRadius as number;
  if (flatStyle?.borderTopLeftRadius !== undefined)
    r.borderTopLeftRadius = flatStyle.borderTopLeftRadius as number;
  if (flatStyle?.borderTopRightRadius !== undefined)
    r.borderTopRightRadius = flatStyle.borderTopRightRadius as number;
  return r;
}

function buildGradientSpread(stops: any, start: any, end: any) {
  return {
    ...(stops ? { locations: stops } : {}),
    ...(start ? { start } : {}),
    ...(end ? { end } : {}),
  };
}

const ASAppBar: React.FC<ASAppBarProps> = (props) => {
  const {
    leadingShow = true,
    leadingIcon = 'arrow_back',
    leadingIconColor: _leadingIconColor,
    leadingIconSize: _leadingIconSize,
    backIconColor,
    backIconSize,
    leadingContainerStyle,
    onPressBackButton,
    centerShow = true,
    centerMode = 'auto',
    title,
    subtitle,
    titleLeadingIcon,
    centerAlignment = 'left',
    centerContainerStyle,
    trailingShow = true,
    actionsLayout = 'row',
    trailingContainerStyle,
    variant = 'default',
    backgroundImage,
    backgroundImageResizeMode = 'cover',
    bottomShape = 'flat',
    bottomShapeRadius,
    bottomShapeColor,
    style,
    textStyles,
    subtitleStyle,
    isPreviewScreen,
    testId = 'ASAppBar',
    children,
  } = props || {};

  // Resolve leading icon props: explicit leadingIconColor/Size take priority;
  // fall back to the widget-library alias names (backIconColor/backIconSize).
  const leadingIconColor = _leadingIconColor ?? backIconColor;
  const leadingIconSize = _leadingIconSize ?? backIconSize;

  // Flatten style once and extract gradient members, same as ASRow/ASContainer.
  const flattenedStyle: ViewStyle & Record<string, unknown> =
    StyleSheet.flatten(style);
  const {
    gradientType: _gradientType,
    gradientColors: _gradientColors,
    gradientStops: _gradientStops,
    gradientStart: _gradientStart,
    gradientEnd: _gradientEnd,
    ...cleanStyle
  } = flattenedStyle || {};
  const hasGradient =
    Array.isArray(_gradientColors) && _gradientColors.length >= 2;

  const isLarge = variant === 'large';
  const isTransparent = variant === 'transparent';

  // Auto-wire navigation.goBack() when no handler is supplied.
  // NavigationContext returns undefined when the component is rendered outside a navigator.
  const navigation = React.useContext(NavigationContext);
  const handleBackPress = onPressBackButton ?? (() => navigation?.goBack?.());

  // ── Positional children routing ──────────────────────────────────────
  // Only centre can claim a custom child. Everything else is trailing.
  const childArr = Children.toArray(children);
  let cursor = 0;
  const centerCustomChild =
    centerShow && centerMode === 'custom' ? childArr[cursor++] : null;
  const trailingChildren = trailingShow ? childArr.slice(cursor) : [];

  // ── Renderers ────────────────────────────────────────────────────────

  const renderLeading = () => {
    // When leading is hidden, return nothing — slot collapses to zero so
    // the centre slot expands to fill the full bar width.
    if (!leadingShow) return null;
    if (!leadingIcon) return null;
    return (
      <TouchableOpacity
        testID={`backButton-${testId}`}
        activeOpacity={0.8}
        style={[styles.iconTouchable, leadingContainerStyle]}
        onPress={handleBackPress}
        accessibilityRole='button'
      >
        <CustomIcon
          icon={leadingIcon}
          size={leadingIconSize}
          color={leadingIconColor}
        />
      </TouchableOpacity>
    );
  };

  const renderTitleNode = () => {
    if (!title) return null;
    const titleText = (
      <ASText testID={`title-${testId}`} numberOfLines={1} style={textStyles}>
        {title}
      </ASText>
    );
    if (titleLeadingIcon) {
      return (
        <View style={styles.titleInlineRow}>
          <CustomIcon
            icon={titleLeadingIcon}
            size={StyleSheet.flatten(textStyles)?.fontSize}
            color={StyleSheet.flatten(textStyles)?.color}
          />
          <View style={{ width: 6 }} />
          {titleText}
        </View>
      );
    }
    return titleText;
  };

  const renderCentre = () => {
    if (!centerShow) return null;
    if (centerMode === 'custom') return centerCustomChild ?? null;
    const t = renderTitleNode();
    const s = subtitle ? (
      <ASText
        testID={`subtitle-${testId}`}
        numberOfLines={1}
        style={subtitleStyle}
      >
        {subtitle}
      </ASText>
    ) : null;
    if (!t && !s) return null;
    return (
      <View style={styles.titleColumn}>
        {t}
        {s}
      </View>
    );
  };

  const renderTrailing = () => {
    // When trailing has no content, return nothing — slot collapses so the
    // centre fills the remaining space without an artificial right margin.
    if (!trailingShow || trailingChildren.length === 0) return null;
    return trailingChildren;
  };

  // Borrow radius members for the background layers' corner masking.
  const borderRadiusStyle = extractBorderRadiusStyle(flattenedStyle);

  const outerStyle: StyleProp<ViewStyle> = [
    styles.container,
    isPreviewScreen ? styles.previewSafeArea : null,
    cleanStyle as ViewStyle,
    isTransparent ? { backgroundColor: 'transparent' } : null,
  ];

  // Arch radius — computed here so both the mainRow spacer and renderBottomShape
  // can reference it without repeating the logic.
  const archR =
    bottomShape === 'rounded' && !!bottomShapeColor
      ? (bottomShapeRadius ?? 24)
      : 0;

  const renderBottomShape = () => {
    // bottomShapeColor must be supplied explicitly (it should match the content
    // area background behind the bar). If absent, no arch decoration is drawn.
    if (!archR) return null;
    return (
      // bottom: 0 anchors the arch at the bar's bottom edge. The mainRow has
      // marginBottom: archR which pushes the icon row above this region, so the
      // arch occupies the bottom archR px of the bar unobstructed.
      // The white rounded-top arch against the blue bar background creates the
      // visual of the bar having rounded bottom corners.
      <View
        pointerEvents='none'
        style={[styles.bottomShape, { height: archR, bottom: 0 }]}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: bottomShapeColor,
            borderTopLeftRadius: archR,
            borderTopRightRadius: archR,
          }}
        />
      </View>
    );
  };

  return (
    <View testID={testId} style={outerStyle}>
      {!!backgroundImage && (
        <ASImage
          testID={`${testId}-BackgroundImage`}
          source={backgroundImage}
          style={[styles.backgroundLayer, borderRadiusStyle] as any}
          resizeMode={backgroundImageResizeMode}
          pointerEvents='none'
        />
      )}
      {hasGradient && (
        <LinearGradient
          colors={_gradientColors as any}
          {...buildGradientSpread(_gradientStops, _gradientStart, _gradientEnd)}
          style={[StyleSheet.absoluteFillObject as any, borderRadiusStyle]}
        />
      )}
      <View
        testID={`view-${testId}`}
        style={[
          styles.mainRow,
          isLarge ? styles.largeRow : null,
          archR > 0 ? { marginBottom: archR } : null,
        ]}
      >
        <View style={styles.leadingSlot}>{renderLeading()}</View>
        <View
          style={[
            styles.centreSlot,
            centerAlignment === 'center' ? styles.centreAligned : null,
            centerAlignment === 'right' ? styles.centreRight : null,
            centerContainerStyle,
          ]}
        >
          {renderCentre()}
        </View>
        <View
          style={[
            styles.trailingSlot,
            actionsLayout === 'column' ? styles.trailingColumn : null,
            trailingContainerStyle,
          ]}
        >
          {renderTrailing()}
        </View>
      </View>
      {renderBottomShape()}
    </View>
  );
};

const styles = StyleSheet.create({
  // No hardcoded minHeight or backgroundColor — all sizing and colour values
  // come from the widget property pipeline (emitted as the `style` prop).
  container: {
    flexDirection: 'column',
    overflow: 'visible',
    // zIndex: 1 ensures the bar floats above siblings with negative margins
    // (e.g. a hero image using marginTop: -barHeight to slide under the bar).
    zIndex: 1,
  },
  previewSafeArea: {
    paddingTop: 22,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // No paddingHorizontal — horizontal padding is carried by the bar-level
    // `style` prop (paddingLeft/paddingRight from the widget definition).
  },
  largeRow: {
    // iOS large-title convention: slots anchor to the bottom of the tall bar.
    alignItems: 'flex-end',
  },
  leadingSlot: {
    // No minWidth — collapses to zero when leadingShow=false so the centre
    // slot can expand to fill the full bar width.
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  centreSlot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    // No paddingHorizontal — would compound with the bar-level padding.
  },
  centreAligned: {
    justifyContent: 'center',
  },
  centreRight: {
    justifyContent: 'flex-end',
  },
  trailingSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  trailingColumn: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  iconTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    // No hardcoded padding — touch area is controlled by leadingContainerStyle.
  },
  titleColumn: {
    flexDirection: 'column',
  },
  titleInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backgroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // No zIndex — JSX paint order already puts the background behind content.
  },
  bottomShape: {
    position: 'absolute',
    left: 0,
    right: 0,
    // bottom and height are set inline; see renderBottomShape().
  },
});

export default ASAppBar;
