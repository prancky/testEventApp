import React, { useCallback, useMemo } from 'react';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ViewStyle,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ImageSourcePropType,
} from 'react-native';
import { getPlatformShadowStyle } from '../../utils/common.utils';
import Svg, {
  Path,
  Defs,
  Filter,
  FeDropShadow,
  LinearGradient as SvgLinearGradient,
  Stop,
  ClipPath,
  Image as SvgImage,
  type SvgProps,
} from 'react-native-svg';

import LinearGradient from 'react-native-linear-gradient';

import ASText from '@/components/ASText';
import glyphMap from '@/assets/fonts/materialIconsGlyphmap.json';

const resolveIconContent = (icon: string): string => {
  const codepoint =
    (glyphMap as Record<string, number>)[icon.replaceAll('_', '-')] ??
    (glyphMap as Record<string, number>)[icon];
  if (codepoint) return String.fromCodePoint(codepoint);
  return icon;
};

// ─── Optional native dependency: blur library ───────────────────────────────
// Resolved lazily so the component degrades to a translucent View when the
// blur library is absent (bare RN without @react-native-community/blur).
let BlurView: React.ComponentType<any> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  BlurView = require('expo-blur').BlurView ?? null;
} catch {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    BlurView = require('@react-native-community/blur').BlurView ?? null;
  } catch {
    BlurView = null;
  }
}

const Tab = createBottomTabNavigator();
type BottomTabRoute = BottomTabBarProps['state']['routes'][number];

export type IconRenderFn = (props: {
  color: string;
  size: number;
  focused?: boolean;
}) => React.ReactNode;

type IconLike = string | React.FC<SvgProps> | IconRenderFn;

export type ASTabItemProps = {
  name: string;
  component: React.ComponentType<object>;
  title: string;
  icon: IconLike;
  /** Icon shown when the tab is focused (variant P5). */
  activeIcon?: IconLike;
  /** Active tint colour for just this tab (variant P12). */
  activeColor?: string;
  tabStyle?: ViewStyle;
  labelStyle?: ViewStyle;
};

export type ASBottomTabShape = 'standard' | 'notched' | 'curved' | 'wave';
export type ASBottomTabStyleVariant =
  | 'solid'
  | 'transparent'
  | 'blur'
  | 'gradient'
  | 'image';
export type ASBottomTabShowLabels = 'always' | 'never' | boolean;
export type ASBottomTabCurvedTrough = 'round' | 'flat' | 'pointed' | 'circular';

export type ASBottomTabGradient = {
  colors: string[];
  stops?: number[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

export type ASBottomTabCenterAction = {
  icon?: IconLike;
  onPress?: () => void;
  size?: number;
  /** Absolute icon size in dp. Replaces the deprecated `iconSizeRatio`. */
  iconSize?: number;
  backgroundColor?: string;
  iconColor?: string;
  /**
   * Semantic vertical anchor. Picks a sensible default offset for the FAB
   * based on the design intent. Overridden by `topOffset` when set.
   *   raised     → top = -(size/2)              (half above the bar)
   *   flush      → top = -size + 8              (bottom of FAB kisses bar top)
   *   inline     → top = (barHeight - size) / 2 (vertically centred)
   *   submerged  → top = barHeight - size/2     (half below the bar)
   */
  anchor?: 'raised' | 'flush' | 'inline' | 'submerged';
  /**
   * Absolute vertical position of the FAB inside the bar's coordinate
   * system. When set, wins over `raised` and `anchor`. Useful for fine
   * tuning when none of the named anchors match the design.
   */
  topOffset?: number | null;
};

// ─── Component props ────────────────────────────────────────────────────────
//
// Every prop here uses the EXACT same name as the backend `/nav-bar`
// property it represents (see TAB_BAR_PROPERTY_DEFS in the SDK adapter).
// No local rename. The two `tabBarGradient` and `tabBarCenterAction` compound
// props are nested objects that the generator builds from the flat scalar
// backend props — the names of those object fields also match the backend
// scalar names (minus the prefix) so the round-trip is mechanical.
export type ASBottomTabNavigationProps = {
  tabs: ASTabItemProps[];
  initialRouteName?: string;
  tabBarStyle?: ViewStyle;

  // Pre-existing fields on the navigator (unchanged).
  activeColor?: string;
  inactiveColor?: string;

  // Variant fields — names match the backend property names verbatim.
  tabBarShape?: ASBottomTabShape;
  tabBarShapeBorderTopLeftRadius?: number;
  tabBarShapeBorderTopRightRadius?: number;
  tabBarShapeBorderBottomLeftRadius?: number;
  tabBarShapeBorderBottomRightRadius?: number;
  tabBarShapeNotchWidth?: number;
  tabBarShapeCurvedDepth?: number;
  /** Visible breathing-room (dp) between the FAB rim and the cradle wall.
   * The component widens the cutout / dip by `2 × gap` so the curve never
   * touches the FAB. */
  tabBarShapeCutoutGap?: number;
  /** notched only — 0..1 fraction of a full semicircle. 1 = full
   * semicircle (current behaviour). 0.5 = quarter-circle (shallow notch). */
  tabBarShapeNotchSweep?: number;
  /** curved only — width (dp) of the soft transition either side of the
   * dip. Defaults to notchWidth × 0.6. */
  tabBarShapeCurvedShoulderWidth?: number | null;
  /** curved only — shape of the trough at the bottom of the dip.
   *   round    = smooth cubic (default)
   *   flat     = U with flat plateau
   *   pointed  = single quadratic (slight V)
   *   circular = 4-bezier circular-arc cup (matches menu.svg reference) */
  tabBarShapeCurvedTrough?: ASBottomTabCurvedTrough;

  tabBarStyleVariant?: ASBottomTabStyleVariant;
  tabBarBlurIntensity?: number;
  tabBarBlurTint?:
    | 'default'
    | 'light'
    | 'dark'
    | 'extraLight'
    | 'regular'
    | 'prominent';

  /** Themed surface (mirrors ASColumn). Generator builds this from the
   * 4 flat `tabBarGradient*` backend properties. */
  tabBarGradient?: ASBottomTabGradient;
  tabBarBackgroundImage?: string | ImageSourcePropType;

  tabBarShowLabels?: ASBottomTabShowLabels;
  tabBarIconSize?: number;

  /** Centre FAB (variants P6 / P7). Generator builds this from the 7 flat
   * `tabBarCenterAction*` backend properties. The `screen` field is the
   * navigation target; we resolve it to an `onPress` at generation time. */
  tabBarCenterAction?: ASBottomTabCenterAction;
};

// ─── Icon renderer ──────────────────────────────────────────────────────────
const TabIconView: React.FC<{
  icon: IconLike | undefined;
  tintColor: string;
  size: number;
  focused?: boolean;
}> = ({ icon, tintColor, size, focused }) => {
  if (!icon) return null;
  if (typeof icon === 'function') {
    try {
      const result = (icon as IconRenderFn)({
        color: tintColor,
        size,
        focused,
      });
      if (React.isValidElement(result)) return <>{result}</>;
    } catch {}
    const SVGIcon = icon as React.FC<SvgProps>;
    return <SVGIcon width={size} height={size} fill={tintColor} />;
  }
  if (typeof icon === 'string') {
    const isURL = /^https?:\/\//i.test(icon) || icon.startsWith('data:');
    if (isURL) {
      return (
        <Image source={{ uri: icon }} style={{ width: size, height: size }} />
      );
    }
    return (
      <ASText
        style={{
          fontSize: size,

          fontFamily: Platform.select({
            ios: 'Material Icon',
            default: 'MaterialIcon',
          }),

          color: tintColor,
        }}
        accessibilityLabel={'tab_icon'}
      >
        {resolveIconContent(icon)}
      </ASText>
    );
  }
  return null;
};

// ─── Single tab item (used by the custom bar) ───────────────────────────────
const TabItem: React.FC<{
  route: BottomTabRoute;
  tab: ASTabItemProps;
  isFocused: boolean;
  activeColor: string;
  inactiveColor: string;
  showLabels: boolean;
  iconSize: number;
  onPress: () => void;
}> = ({
  route,
  tab,
  isFocused,
  activeColor,
  inactiveColor,
  showLabels,
  iconSize,
  onPress,
}) => {
  const color = isFocused ? (tab.activeColor ?? activeColor) : inactiveColor;
  const icon = isFocused && tab.activeIcon ? tab.activeIcon : tab.icon;
  return (
    <TouchableOpacity
      key={route.key}
      style={[styles.tabButton, tab.tabStyle]}
      accessibilityRole='button'
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
    >
      <TabIconView
        icon={icon}
        tintColor={color}
        size={iconSize}
        focused={isFocused}
      />
      {showLabels && tab.title ? (
        <Text style={[styles.tabLabel, { color }, tab.labelStyle]}>
          {tab.title}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

// ─── Shape rendering (SVG path) ─────────────────────────────────────────────
//
// notched : a CIRCULAR cutout at the centre of the top edge. The FAB sits
//           inside the cutout, partially overlapping the bar (Material 2
//           BottomAppBar — variant P7).
// curved  : the entire top edge is a smooth concave dip — no FAB required
//           (variant P15).
// wave    : a low-amplitude sinusoidal wave across the top edge.
// standard: flat rectangle. SVG path is null and we paint a normal View.

type ShapeNotch = {
  width: number;
  curvedDepth: number;
  cutoutGap: number;
  notchSweep: number;
  curvedShoulderWidth: number | null;
  curvedTrough: ASBottomTabCurvedTrough;
};

function buildFooter(
  width: number,
  height: number,
  radii: { tl: number; tr: number; bl: number; br: number },
): string {
  const { bl, br } = radii;
  return [
    `L ${width},${height - br}`,
    br > 0 ? `Q ${width},${height} ${width - br},${height}` : '',
    `L ${bl},${height}`,
    bl > 0 ? `Q 0,${height} 0,${height - bl}` : '',
    `Z`,
  ]
    .filter(Boolean)
    .join(' ');
}

function buildNotchedPath(
  width: number,
  radii: { tl: number; tr: number },
  notch: ShapeNotch,
  footer: string,
): string {
  const cx = width / 2;
  const { tl, tr } = radii;
  const slotHalf = Math.max(8, notch.width / 2);
  const r = slotHalf + Math.max(0, notch.cutoutGap);
  const sweep = Math.max(0, Math.min(1, notch.notchSweep ?? 1));
  if (sweep <= 0) {
    return [
      `M 0,${tl}`,
      tl > 0 ? `Q 0,0 ${tl},0` : '',
      `L ${width - tr},0`,
      tr > 0 ? `Q ${width},0 ${width},${tr}` : '',
      footer,
    ].join(' ');
  }
  const theta = (Math.PI * sweep) / 2;
  const halfChord = r * Math.sin(theta);
  const cutoutStartX = cx - halfChord;
  const cutoutEndX = cx + halfChord;
  return [
    `M 0,${tl}`,
    tl > 0 ? `Q 0,0 ${tl},0` : '',
    `L ${cutoutStartX},0`,
    `A ${r} ${r} 0 0 0 ${cutoutEndX},0`,
    `L ${width - tr},0`,
    tr > 0 ? `Q ${width},0 ${width},${tr}` : '',
    footer,
  ].join(' ');
}

type CurvedTroughArgs = {
  cx: number;
  halfW: number;
  h: number;
  tl: number;
  tr: number;
  width: number;
  dipStart: number;
  dipEnd: number;
  depth: number;
  footer: string;
};

function buildFlatTrough({
  cx,
  halfW,
  h,
  tl,
  tr,
  width,
  dipStart,
  dipEnd,
  depth,
  footer,
}: CurvedTroughArgs): string {
  const plateauHalf = Math.max(8, halfW * 0.2);
  const plateauStart = cx - plateauHalf;
  const plateauEnd = cx + plateauHalf;
  return [
    `M 0,${tl}`,
    tl > 0 ? `Q 0,0 ${tl},0` : '',
    `L ${dipStart},0`,
    `C ${dipStart + h},0 ${plateauStart - h * 0.3},${depth} ${plateauStart},${depth}`,
    `L ${plateauEnd},${depth}`,
    `C ${plateauEnd + h * 0.3},${depth} ${dipEnd - h},0 ${dipEnd},0`,
    `L ${width - tr},0`,
    tr > 0 ? `Q ${width},0 ${width},${tr}` : '',
    footer,
  ].join(' ');
}

function buildPointedTrough({
  cx,
  tl,
  tr,
  width,
  dipStart,
  dipEnd,
  depth,
  footer,
}: CurvedTroughArgs): string {
  return [
    `M 0,${tl}`,
    tl > 0 ? `Q 0,0 ${tl},0` : '',
    `L ${dipStart},0`,
    `Q ${cx},${depth * 2} ${dipEnd},0`,
    `L ${width - tr},0`,
    tr > 0 ? `Q ${width},0 ${width},${tr}` : '',
    footer,
  ].join(' ');
}

function buildCircularTrough({
  cx,
  halfW,
  h,
  tl,
  tr,
  width,
  dipStart,
  dipEnd,
  depth,
  footer,
}: CurvedTroughArgs): string {
  // 4-bezier circular-arc cup — derived from menu.svg (viewBox 0 0 390 118).
  // Each half uses 2 cubic beziers with a "knee" at ~22% of depth where the
  // tangent transitions from horizontal to vertical, producing a cup shape
  // that closely follows a circular arc.
  //
  // Ratios verified against SVG measurements (halfW=62, depth=67):
  //   kneeInset = halfW*0.206 → 12.77  (SVG: 146-133.234 = 12.77 ✓)
  //   kneeY     = depth*0.216 → 14.47  (SVG: 44.5-30     = 14.5  ✓)
  //   cpY1      = depth*0.106 →  7.1   (SVG seg1 CP2 y   = 7.1   ✓)
  //   cpY2      = depth*0.648 → 43.4   (SVG seg2 CP1 y   = 43.5  ✓)
  //   botCP     = halfW*0.439 → 27.2   (SVG seg2 CP2 Δx  = 27.2  ✓)
  const kneeInset = halfW * 0.206;
  const kneeX_L = dipStart + kneeInset;
  const kneeX_R = dipEnd - kneeInset;
  const kneeY = depth * 0.216;
  const cpY1 = depth * 0.106;
  const cpY2 = depth * 0.648;
  const botCP = halfW * 0.439;
  return [
    `M 0,${tl}`,
    tl > 0 ? `Q 0,0 ${tl},0` : '',
    `L ${dipStart},0`,
    `C ${dipStart + h},0 ${kneeX_L},${cpY1} ${kneeX_L},${kneeY}`,
    `C ${kneeX_L},${cpY2} ${cx - botCP},${depth} ${cx},${depth}`,
    `C ${cx + botCP},${depth} ${kneeX_R},${cpY2} ${kneeX_R},${kneeY}`,
    `C ${kneeX_R},${cpY1} ${dipEnd - h},0 ${dipEnd},0`,
    `L ${width - tr},0`,
    tr > 0 ? `Q ${width},0 ${width},${tr}` : '',
    footer,
  ].join(' ');
}

function buildRoundTrough({
  cx,
  halfW,
  h,
  tl,
  tr,
  width,
  dipStart,
  dipEnd,
  depth,
  footer,
}: CurvedTroughArgs): string {
  const innerCPDistance = halfW * 0.45;
  return [
    `M 0,${tl}`,
    tl > 0 ? `Q 0,0 ${tl},0` : '',
    `L ${dipStart},0`,
    `C ${dipStart + h},0 ${cx - innerCPDistance},${depth} ${cx},${depth}`,
    `C ${cx + innerCPDistance},${depth} ${dipEnd - h},0 ${dipEnd},0`,
    `L ${width - tr},0`,
    tr > 0 ? `Q ${width},0 ${width},${tr}` : '',
    footer,
  ].join(' ');
}

function buildCurvedPath(
  width: number,
  radii: { tl: number; tr: number },
  notch: ShapeNotch,
  footer: string,
): string {
  const cx = width / 2;
  const { tl, tr } = radii;
  const baseHalf = Math.max(notch.width / 2, 24);
  const halfW = baseHalf + Math.max(0, notch.cutoutGap);
  const dipStart = cx - halfW;
  const dipEnd = cx + halfW;
  const depth = notch.curvedDepth;
  const shoulder =
    notch.curvedShoulderWidth == null
      ? halfW * 0.6
      : Math.max(0, notch.curvedShoulderWidth);
  const h = Math.min(shoulder, halfW * 0.95);
  const trough = notch.curvedTrough ?? 'round';
  const args: CurvedTroughArgs = {
    cx,
    halfW,
    h,
    tl,
    tr,
    width,
    dipStart,
    dipEnd,
    depth,
    footer,
  };
  const builders: Record<string, (a: CurvedTroughArgs) => string> = {
    flat: buildFlatTrough,
    pointed: buildPointedTrough,
    circular: buildCircularTrough,
  };
  return (builders[trough] ?? buildRoundTrough)(args);
}

function buildWavePath(
  width: number,
  radii: { tl: number; tr: number },
  notch: Pick<ShapeNotch, 'curvedDepth'>,
  footer: string,
): string {
  const { tl, tr } = radii;
  const amp = Math.max(8, Math.max(tl, tr, notch.curvedDepth));
  const seg = width / 4;
  return [
    `M 0,${amp}`,
    `Q ${seg},0 ${seg * 2},${amp}`,
    `T ${width},${amp}`,
    footer,
  ].join(' ');
}

function buildShapePath(
  shape: ASBottomTabShape,
  width: number,
  height: number,
  radii: { tl: number; tr: number; bl: number; br: number },
  notch: ShapeNotch,
): string | null {
  const footer = buildFooter(width, height, radii);
  if (shape === 'notched') return buildNotchedPath(width, radii, notch, footer);
  if (shape === 'curved') return buildCurvedPath(width, radii, notch, footer);
  if (shape === 'wave') return buildWavePath(width, radii, notch, footer);
  return null;
}

// ─── Surface renderer ───────────────────────────────────────────────────────

type ShapeShadow = {
  dx: number;
  dy: number;
  stdDeviation: number;
  color: string;
  opacity: number;
};

type SurfaceArgs = {
  width: number;
  height: number;
  styleVariant: ASBottomTabStyleVariant;
  gradient?: ASBottomTabGradient;
  backgroundImage?: string | ImageSourcePropType;
  blurIntensity: number;
  blurTint: NonNullable<ASBottomTabNavigationProps['tabBarBlurTint']>;
  backgroundColor: string;
  shapeShadow?: ShapeShadow;
};

// Shared SVG drop-shadow filter used by every shaped-surface renderer below.
// Returns the `<Filter id='bar-shadow'>` element (referenced via
// `filter='url(#bar-shadow)'`) or null when no shadow is configured, so the
// four renderers no longer repeat the identical filter markup.
function renderBarShadowFilter(
  shapeShadow?: ShapeShadow,
): React.ReactElement | null {
  if (!shapeShadow) return null;
  return (
    <Filter id='bar-shadow' x='-50%' y='-50%' width='200%' height='200%'>
      <FeDropShadow
        dx={shapeShadow.dx}
        dy={shapeShadow.dy}
        stdDeviation={shapeShadow.stdDeviation}
        floodColor={shapeShadow.color}
        floodOpacity={shapeShadow.opacity}
      />
    </Filter>
  );
}

function renderShapedGradient(
  path: string,
  width: number,
  height: number,
  gradient: ASBottomTabGradient,
  shapeShadow?: ShapeShadow,
): React.ReactElement {
  const start = gradient.start ?? { x: 0, y: 0 };
  const end = gradient.end ?? { x: 1, y: 0 };
  const colors = gradient.colors;
  const stops = gradient.stops;
  return (
    <Svg
      width={width}
      height={height}
      style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
      {...({ overflow: 'visible' } as any)}
    >
      <Defs>
        {renderBarShadowFilter(shapeShadow)}
        <SvgLinearGradient
          id='bar-grad'
          x1={String(start.x)}
          y1={String(start.y)}
          x2={String(end.x)}
          y2={String(end.y)}
        >
          {colors
            .map((c, pos) => ({
              c,
              offset: stops?.[pos] ?? pos / (colors.length - 1 || 1),
            }))
            .map(({ c, offset }) => (
              <Stop
                key={`${c}-${offset}`}
                offset={String(offset)}
                stopColor={c}
              />
            ))}
        </SvgLinearGradient>
      </Defs>
      <Path
        d={path}
        fill='url(#bar-grad)'
        {...(shapeShadow ? { filter: 'url(#bar-shadow)' } : {})}
      />
    </Svg>
  );
}

function renderShapedImage(
  path: string,
  width: number,
  height: number,
  backgroundImage: string | ImageSourcePropType,
  shapeShadow?: ShapeShadow,
): React.ReactElement {
  const imageHref =
    typeof backgroundImage === 'string'
      ? backgroundImage
      : ((backgroundImage as any)?.uri ?? '');
  return (
    <Svg
      width={width}
      height={height}
      style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
      {...({ overflow: 'visible' } as any)}
    >
      <Defs>
        {renderBarShadowFilter(shapeShadow)}
        <ClipPath id='bar-clip'>
          <Path d={path} />
        </ClipPath>
      </Defs>
      {/* Shadow path — near-zero alpha so feDropShadow has a shape to compute
           from (fill='transparent' = alpha 0 = no shadow rendered). Covered
           by SvgImage above so the near-black tint is imperceptible. */}
      {shapeShadow && (
        <Path d={path} fill='rgba(0,0,0,0.001)' filter='url(#bar-shadow)' />
      )}
      <SvgImage
        href={imageHref}
        x={0}
        y={0}
        width={width}
        height={height}
        preserveAspectRatio='xMidYMid slice'
        clipPath='url(#bar-clip)'
      />
    </Svg>
  );
}

function renderShapedBlur(
  path: string,
  width: number,
  height: number,
  blurIntensity: number,
  blurTint: NonNullable<ASBottomTabNavigationProps['tabBarBlurTint']>,
  shapeShadow?: ShapeShadow,
): React.ReactElement {
  return (
    <>
      <Svg
        width={width}
        height={height}
        style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
        {...({ overflow: 'visible' } as any)}
      >
        {shapeShadow && <Defs>{renderBarShadowFilter(shapeShadow)}</Defs>}
        <Path
          d={path}
          fill='rgba(255,255,255,0.001)'
          {...(shapeShadow ? { filter: 'url(#bar-shadow)' } : {})}
        />
      </Svg>
      <BlurView
        intensity={blurIntensity}
        tint={blurTint as any}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}

function renderShapedSolid(
  path: string,
  width: number,
  height: number,
  fill: string,
  shapeShadow?: ShapeShadow,
): React.ReactElement {
  return (
    <Svg
      width={width}
      height={height}
      style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
      {...({ overflow: 'visible' } as any)}
    >
      {shapeShadow && <Defs>{renderBarShadowFilter(shapeShadow)}</Defs>}
      <Path
        d={path}
        fill={fill}
        {...(shapeShadow ? { filter: 'url(#bar-shadow)' } : {})}
      />
    </Svg>
  );
}

function renderShapedPath(path: string, args: SurfaceArgs): React.ReactElement {
  const {
    width,
    height,
    styleVariant,
    gradient,
    backgroundImage,
    blurIntensity,
    blurTint,
    backgroundColor,
    shapeShadow,
  } = args;
  if (
    styleVariant === 'gradient' &&
    gradient?.colors &&
    gradient.colors.length >= 2
  ) {
    return renderShapedGradient(path, width, height, gradient, shapeShadow);
  }
  if (styleVariant === 'image' && backgroundImage)
    return renderShapedImage(path, width, height, backgroundImage, shapeShadow);
  const fill =
    styleVariant === 'transparent' || styleVariant === 'blur'
      ? 'transparent'
      : backgroundColor;
  if (styleVariant === 'blur' && BlurView)
    return renderShapedBlur(
      path,
      width,
      height,
      blurIntensity,
      blurTint,
      shapeShadow,
    );
  return renderShapedSolid(path, width, height, fill, shapeShadow);
}

function renderFlatSurface(args: SurfaceArgs): React.ReactElement | null {
  const {
    styleVariant,
    gradient,
    backgroundImage,
    blurIntensity,
    blurTint,
    backgroundColor,
  } = args;
  if (styleVariant === 'transparent') return null;
  if (styleVariant === 'blur') {
    // CRITICAL: BlurView must be the SOLE child — do NOT place any View
    // underneath it. BlurView blurs the native pixels behind its own bounds.
    // Fallback when expo-blur is absent: a semi-transparent View.
    if (!BlurView) {
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(255,255,255,0.7)' },
          ]}
        />
      );
    }
    return (
      <BlurView
        intensity={blurIntensity}
        tint={blurTint as any}
        style={StyleSheet.absoluteFill}
      />
    );
  }
  if (
    styleVariant === 'gradient' &&
    gradient?.colors &&
    gradient.colors.length >= 2
  ) {
    return (
      <LinearGradient
        colors={gradient.colors}
        start={gradient.start ?? { x: 0, y: 0 }}
        end={gradient.end ?? { x: 1, y: 0 }}
        locations={gradient.stops}
        style={StyleSheet.absoluteFill}
      />
    );
  }
  if (styleVariant === 'image' && backgroundImage) {
    const source =
      typeof backgroundImage === 'string'
        ? { uri: backgroundImage }
        : backgroundImage;
    return (
      <Image
        source={source}
        resizeMode='cover'
        style={StyleSheet.absoluteFill}
      />
    );
  }
  return <View style={[StyleSheet.absoluteFill, { backgroundColor }]} />;
}

const SurfaceLayer: React.FC<{
  width: number;
  height: number;
  styleVariant: ASBottomTabStyleVariant;
  shape: ASBottomTabShape;
  radii: { tl: number; tr: number; bl: number; br: number };
  notch: {
    width: number;
    curvedDepth: number;
    cutoutGap: number;
    notchSweep: number;
    curvedShoulderWidth: number | null;
    curvedTrough: ASBottomTabCurvedTrough;
  };
  blurIntensity: number;
  blurTint: NonNullable<ASBottomTabNavigationProps['tabBarBlurTint']>;
  backgroundColor: string;
  gradient?: ASBottomTabGradient;
  backgroundImage?: string | ImageSourcePropType;
  /** When the bar has a non-standard shape (notched/curved/wave), the shadow is
   * applied here via SVG feDropShadow so it follows the actual bar outline,
   * not the rectangular bounding box of barContainer (which would leak through
   * the transparent cutout and produce a semi-circle artefact under the FAB). */
  shapeShadow?: ShapeShadow;
}> = ({
  width,
  height,
  styleVariant,
  shape,
  radii,
  notch,
  blurIntensity,
  blurTint,
  backgroundColor,
  gradient,
  backgroundImage,
  shapeShadow,
}) => {
  const path = buildShapePath(shape, width, height, radii, notch);
  const surfaceArgs: SurfaceArgs = {
    width,
    height,
    styleVariant,
    gradient,
    backgroundImage,
    blurIntensity,
    blurTint,
    backgroundColor,
    shapeShadow,
  };
  if (path) return renderShapedPath(path, surfaceArgs);
  return renderFlatSurface(surfaceArgs);
};

// ─── FAB split calculation ───────────────────────────────────────────────────
//
// Determines how many tabs go left / right of the FAB and whether a phantom
// spacer is needed to keep the bar visually balanced.
//
//   totalTabs  leftCount  rightCount  phantomCount
//   ─────────  ─────────  ──────────  ────────────
//       0          0          0           0
//       1          1          0           0
//       2          1          1           0   ← even, balanced
//       3          2          1           1   ← odd: nearest tab hugs FAB, phantom right
//       4          2          2           0   ← even, balanced
//       5          3          2           1
//       6          3          3           0
//
// With no center action: all tabs render in order, no phantom (backward-compat).
function computeFabSplit(totalTabs: number): {
  leftCount: number;
  rightCount: number;
  phantomCount: number;
} {
  if (totalTabs === 0) return { leftCount: 0, rightCount: 0, phantomCount: 0 };
  const leftCount = Math.ceil(totalTabs / 2);
  const rightCount = Math.floor(totalTabs / 2);
  // Add a phantom spacer only when the split is uneven (odd total).
  const phantomCount = totalTabs % 2 === 1 ? 1 : 0;
  return { leftCount, rightCount, phantomCount };
}

// ─── Custom tab bar ─────────────────────────────────────────────────────────
const CustomTabBar: React.FC<
  BottomTabBarProps & {
    tabs: ASTabItemProps[];
    activeColor: string;
    inactiveColor: string;
    tabBarStyle?: ViewStyle;
    showLabels: boolean;
    iconSize: number;
    styleVariant: ASBottomTabStyleVariant;
    shape: ASBottomTabShape;
    radii: { tl: number; tr: number; bl: number; br: number };
    notch: {
      width: number;
      curvedDepth: number;
      cutoutGap: number;
      notchSweep: number;
      curvedShoulderWidth: number | null;
      curvedTrough: ASBottomTabCurvedTrough;
    };
    blurIntensity: number;
    blurTint: NonNullable<ASBottomTabNavigationProps['tabBarBlurTint']>;
    gradient?: ASBottomTabGradient;
    backgroundImage?: string | ImageSourcePropType;
    centerAction?: ASBottomTabCenterAction;
  }
> = ({
  state,
  navigation,
  tabs,
  activeColor,
  inactiveColor,
  tabBarStyle,
  showLabels,
  iconSize,
  styleVariant,
  shape,
  radii,
  notch,
  blurIntensity,
  blurTint,
  gradient,
  backgroundImage,
  centerAction,
}) => {
  const { width } = useWindowDimensions();
  // Height and background come from the navigator's tabBarStyle group —
  // the same place React Navigation's default bar reads them from. No
  // hard-coded fallback: when the backend doesn't supply tabBarStyle, the
  // wrapper just sizes to its children and stays transparent.
  const height = tabBarStyle?.height as number;
  const bg = tabBarStyle?.backgroundColor as string;

  // Extract platform-specific shadow style from tabBarStyle — mirrors the
  // same pattern used in ASColumn. The generator's decomposeShadowEffectToken
  // pass converts new prop names (blur, spread, xOffset, yOffset) to the RN
  // equivalents (shadowRadius, shadowSpread, shadowOffset) and resolves
  // composite effect tokens. getPlatformShadowStyle then translates those RN
  // shadow properties to the correct per-platform format:
  //   iOS     → shadowColor + shadowRadius + shadowOpacity + shadowOffset
  //   Android → boxShadow CSS string (supported from React Native 0.79+)
  //   Web     → boxShadow CSS string
  // Applied AFTER tabBarStyle in the style array so it overrides raw props.
  const flatTabBarStyle = tabBarStyle ? StyleSheet.flatten(tabBarStyle) : null;
  const platformShadowStyle = getPlatformShadowStyle(flatTabBarStyle);

  // For non-standard shapes (notched/curved/wave) the bar's visual outline is
  // an SVG path, not the rectangular barContainer. Applying platformShadowStyle
  // to the rectangle leaks through the transparent cutout (e.g. the notch),
  // producing a semi-circular shadow artefact beneath the FAB. Instead we pass
  // the raw shadow values to SurfaceLayer, which applies them via SVG
  // feDropShadow so the shadow follows the actual bar shape.
  const hasFlatShadow =
    flatTabBarStyle &&
    (flatTabBarStyle.shadowColor !== undefined ||
      flatTabBarStyle.shadowRadius !== undefined ||
      flatTabBarStyle.shadowOpacity !== undefined ||
      flatTabBarStyle.shadowOffset !== undefined);
  const shapeShadow =
    shape !== 'standard' && hasFlatShadow
      ? {
          dx: ((flatTabBarStyle.shadowOffset as any)?.width as number) ?? 0,
          dy: ((flatTabBarStyle.shadowOffset as any)?.height as number) ?? 0,
          stdDeviation: flatTabBarStyle.shadowRadius ?? 0,
          color: (flatTabBarStyle.shadowColor as string) ?? '#000000',
          opacity: (flatTabBarStyle.shadowOpacity as number) ?? 1,
        }
      : undefined;

  // When the bar has horizontal margins (e.g. floating pill: marginLeft=20,
  // marginRight=20), the barContainer's content box is narrower than the
  // screen. All position:absolute children (FAB, SVG) are placed relative to
  // that content box, so we must subtract the margins from the window width.
  const barMarginLeft = (flatTabBarStyle?.marginLeft as number) ?? 0;
  const barMarginRight = (flatTabBarStyle?.marginRight as number) ?? 0;
  const barWidth = width - barMarginLeft - barMarginRight;

  // For shaped bars the shadow is handled entirely by SVG feDropShadow inside
  // SurfaceLayer. Strip raw iOS/RN shadow props from tabBarStyle before
  // applying it to the rectangular barContainer — those props cause the
  // container View to cast a rectangular shadow that bleeds through the
  // transparent curved/notched cutout, producing a visible line artifact at
  // the dip boundary where inner and outer backgrounds should match.
  const containerTabBarStyle =
    shape !== 'standard' && flatTabBarStyle
      ? (({
          shadowColor: _sc,
          shadowRadius: _sr,
          shadowOpacity: _so,
          shadowOffset: _soff,
          shadowSpread: _ssp,
          elevation: _el,
          boxShadow: _bs,
          ...rest
        }) => rest)(flatTabBarStyle as any)
      : tabBarStyle;

  // Remove the wrapper's opaque background entirely when:
  //   (a) the surface variant is transparent or blur — otherwise the
  //       SurfaceLayer's transparency is hidden behind the wrapper's fill; OR
  //   (b) the bar has a non-standard shape (notched / curved / wave) — the SVG
  //       path in SurfaceLayer defines the visible bar outline, so the wrapper
  //       View behind it must be transparent to expose the cutout / dip area
  //       (e.g. the notch in P7, the curved dip in P15).
  const wrapperBg =
    shape !== 'standard' ||
    styleVariant === 'transparent' ||
    styleVariant === 'blur'
      ? 'transparent'
      : undefined;

  const handleTabPress = (route: BottomTabRoute, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const renderTabItem = (route: BottomTabRoute, globalIndex: number) => {
    const tab = tabs.find((t) => t.name === route.name);
    if (!tab) return null;
    const isFocused = state.index === globalIndex;
    return (
      <TabItem
        key={route.key}
        route={route}
        tab={tab}
        isFocused={isFocused}
        activeColor={activeColor}
        inactiveColor={inactiveColor}
        showLabels={showLabels}
        iconSize={iconSize}
        onPress={() => handleTabPress(route, isFocused)}
      />
    );
  };

  const hasCenter = !!centerAction?.screen;
  // FAB fields are all required when there is a centre action (the
  // generator builds the object only when tabBarCenterActionScreen is set).
  // The FAB icon is always derived from the centerActionScreen tab's own
  // icon — tabBarCenterActionIcon is deprecated and never read.
  const fabSize = centerAction?.size ?? 0;
  const fabBg = centerAction?.backgroundColor;
  const fabIconColor = centerAction?.iconColor;

  // ── FAB split ────────────────────────────────────────────────────────────
  //
  // No center action → render all routes in order, no phantom (backward-
  // compatible with all existing apps that don't use a FAB).
  //
  // Center action present → use computeFabSplit to determine how many tabs
  // go left / right of the FAB placeholder and whether a phantom spacer is
  // needed to balance the right side.
  //
  //   Example: 3 tabs [Home, Search, Alerts]
  //     leftCount=2, rightCount=1, phantomCount=1
  //     Row: [Home][Search] [FAB placeholder] [Alerts] [phantom]
  //                                            ↑ nearest to FAB  ↑ empty flex:1
  //
  //   Example: 4 tabs [Home, Search, Alerts, Profile]
  //     leftCount=2, rightCount=2, phantomCount=0
  //     Row: [Home][Search] [FAB placeholder] [Alerts][Profile]
  //
  //   Example: 2 tabs [Home, Alerts]
  //     leftCount=1, rightCount=1, phantomCount=0
  //     Row: [Home] [FAB placeholder] [Alerts]
  const { leftCount, rightCount, phantomCount } = hasCenter
    ? computeFabSplit(state.routes.length)
    : { leftCount: 0, rightCount: 0, phantomCount: 0 };

  // ── FAB vertical positioning ────────────────────────────────────────
  // Resolution order: explicit topOffset > anchor enum > legacy `raised`.
  const resolveFabTop = (): number => {
    if (
      centerAction?.topOffset !== undefined &&
      centerAction?.topOffset !== null
    ) {
      return centerAction.topOffset;
    }
    const anchor = centerAction?.anchor;
    switch (anchor) {
      case 'flush':
        // FAB's bottom edge kisses the bar's top, peeking 8 dp above.
        return -fabSize + 8;
      case 'inline':
        return (height - fabSize) / 2;
      case 'submerged':
        return height - fabSize / 2;
      case 'raised':
        return -(fabSize / 2);
      case undefined:
      default:
        // Default to `raised` position (half above the bar) — matches
        // the adapter's seeded default for tabBarCenterActionAnchor.
        return -(fabSize / 2);
    }
  };
  const fabTop = hasCenter ? resolveFabTop() : 0;

  return (
    <View style={[styles.barLayoutWrapper, { height }]}>
      <View
        style={[
          styles.barContainer,
          {
            height,
            borderTopLeftRadius: radii.tl,
            borderTopRightRadius: radii.tr,
            borderBottomLeftRadius: radii.bl,
            borderBottomRightRadius: radii.br,
          },
          containerTabBarStyle,
          // For standard bars apply platform shadow to the container rectangle.
          // For shaped bars (notched/curved/wave) the shadow is applied via SVG
          // feDropShadow inside SurfaceLayer so it follows the bar outline and
          // does NOT bleed through the transparent notch/cutout (which would
          // create a semi-circular artefact beneath the FAB).
          shape === 'standard' ? platformShadowStyle : null,
          wrapperBg === undefined ? null : { backgroundColor: wrapperBg },
        ]}
      >
        {/* Clip wrapper — for the BLUR variant only, constrains the BlurView
            strictly to the bar bounds (BlurView absoluteFill otherwise bleeds over
            the whole screen because barContainer is overflow:visible). For every
            other variant we must NOT clip: the SVG fill path carries the drop
            shadow (FeDropShadow), whose soft halo extends beyond the bar
            outline and would be cropped by overflow:hidden. */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              overflow: styleVariant === 'blur' ? 'hidden' : 'visible',
              borderTopLeftRadius: radii.tl,
              borderTopRightRadius: radii.tr,
              borderBottomLeftRadius: radii.bl,
              borderBottomRightRadius: radii.br,
            },
          ]}
        >
          <SurfaceLayer
            width={barWidth}
            height={height}
            styleVariant={styleVariant}
            shape={shape}
            radii={radii}
            notch={notch}
            blurIntensity={blurIntensity}
            blurTint={blurTint}
            backgroundColor={bg}
            gradient={gradient}
            backgroundImage={backgroundImage}
            shapeShadow={shapeShadow}
          />
        </View>
        <View style={styles.tabRow}>
          {hasCenter ? (
            <>
              {/* Left tabs */}
              {state.routes
                .slice(0, leftCount)
                .map((route, i) => renderTabItem(route, i))}

              {/* FAB placeholder — reserves the same width as the FAB button */}
              <View style={{ width: fabSize + 24 }} />

              {/* Right tabs — first tab is nearest to the FAB */}
              {state.routes
                .slice(leftCount, leftCount + rightCount)
                .map((route, i) => renderTabItem(route, leftCount + i))}

              {/* Phantom spacer — balances the row when tab count is odd.
                  Has flex:1 (same as a real TabItem) so it occupies the same
                  visual weight as a missing tab, keeping the FAB centred. */}
              {Array.from(
                { length: phantomCount },
                (_, i) => `phantom-spacer-${i}`,
              ).map((phantomKey) => (
                <View key={phantomKey} style={styles.tabButton} />
              ))}
            </>
          ) : (
            // No FAB → original behaviour, fully backward-compatible.
            state.routes.map((route, i) => renderTabItem(route, i))
          )}
        </View>
        {hasCenter && (
          <TouchableOpacity
            accessibilityRole='button'
            activeOpacity={0.85}
            onPress={centerAction?.onPress}
            style={[
              styles.centerAction,
              {
                width: fabSize,
                height: fabSize,
                borderRadius: fabSize / 2,
                left: barWidth / 2 - fabSize / 2,
                top: fabTop,
                backgroundColor: fabBg,
              },
            ]}
          >
            <TabIconView
              icon={centerAction!.icon}
              tintColor={fabIconColor as string}
              size={centerAction!.iconSize as number}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

function makeTabBarIcon(tab: ASTabItemProps) {
  return ({
    color,
    size,
    focused,
  }: {
    color: string;
    size: number;
    focused: boolean;
  }) => (
    <TabIconView
      icon={focused && tab.activeIcon ? tab.activeIcon : tab.icon}
      tintColor={color}
      size={size}
      focused={focused}
    />
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
const ASBottomTabNavigation: React.FC<ASBottomTabNavigationProps> = ({
  tabs,
  initialRouteName,
  activeColor,
  inactiveColor,
  tabBarStyle,
  tabBarShape,
  tabBarShapeBorderTopLeftRadius,
  tabBarShapeBorderTopRightRadius,
  tabBarShapeBorderBottomLeftRadius,
  tabBarShapeBorderBottomRightRadius,
  tabBarShapeNotchWidth,
  tabBarShapeCurvedDepth,
  tabBarShapeCutoutGap,
  tabBarShapeNotchSweep,
  tabBarShapeCurvedShoulderWidth,
  tabBarShapeCurvedTrough,
  tabBarStyleVariant,
  tabBarShowLabels,
  tabBarIconSize,
  tabBarBlurIntensity,
  tabBarBlurTint,
  tabBarGradient,
  tabBarBackgroundImage,
  tabBarCenterAction,
}) => {
  // When tabBarShowLabels is undefined (prop not passed) the spec default
  // is 'always' — treat null/undefined as true so labels show by default.
  let showLabelsResolved: boolean;
  if (tabBarShowLabels == null) {
    showLabelsResolved = true;
  } else if (tabBarShowLabels === 'never') {
    showLabelsResolved = false;
  } else if (tabBarShowLabels === 'always') {
    showLabelsResolved = true;
  } else {
    showLabelsResolved = !!tabBarShowLabels;
  }

  const usesCustomBar = true;

  const radii = useMemo(
    () => ({
      tl: tabBarShapeBorderTopLeftRadius,
      tr: tabBarShapeBorderTopRightRadius,
      bl: tabBarShapeBorderBottomLeftRadius,
      br: tabBarShapeBorderBottomRightRadius,
    }),
    [
      tabBarShapeBorderTopLeftRadius,
      tabBarShapeBorderTopRightRadius,
      tabBarShapeBorderBottomLeftRadius,
      tabBarShapeBorderBottomRightRadius,
    ],
  );

  const notch = useMemo(
    () => ({
      width: tabBarShapeNotchWidth,
      curvedDepth: tabBarShapeCurvedDepth,
      cutoutGap: tabBarShapeCutoutGap ?? 0,
      notchSweep: tabBarShapeNotchSweep ?? 1,
      curvedShoulderWidth: tabBarShapeCurvedShoulderWidth ?? null,
      curvedTrough: tabBarShapeCurvedTrough ?? 'round',
    }),
    [
      tabBarShapeNotchWidth,
      tabBarShapeCurvedDepth,
      tabBarShapeCutoutGap,
      tabBarShapeNotchSweep,
      tabBarShapeCurvedShoulderWidth,
      tabBarShapeCurvedTrough,
    ],
  );

  const renderCustomBar = useCallback(
    (props: BottomTabBarProps) => (
      <CustomTabBar
        {...props}
        tabs={tabs}
        activeColor={activeColor}
        inactiveColor={inactiveColor}
        tabBarStyle={tabBarStyle}
        showLabels={showLabelsResolved}
        iconSize={tabBarIconSize}
        styleVariant={tabBarStyleVariant}
        shape={tabBarShape}
        radii={radii}
        notch={notch}
        blurIntensity={tabBarBlurIntensity}
        blurTint={
          tabBarBlurTint as NonNullable<
            ASBottomTabNavigationProps['tabBarBlurTint']
          >
        }
        gradient={tabBarGradient}
        backgroundImage={tabBarBackgroundImage}
        centerAction={tabBarCenterAction}
      />
    ),
    [
      tabs,
      activeColor,
      inactiveColor,
      tabBarStyle,
      showLabelsResolved,
      tabBarIconSize,
      tabBarStyleVariant,
      tabBarShape,
      radii,
      notch,
      tabBarBlurIntensity,
      tabBarBlurTint,
      tabBarGradient,
      tabBarBackgroundImage,
      tabBarCenterAction,
    ],
  );

  const screenOptions = useMemo(
    () => ({
      tabBarStyle: {
        borderTopWidth: 0,
        borderTopColor: 'transparent',
        ...tabBarStyle,
      } as ViewStyle,
      // Default the label font-size to 12 (Material 3 caption) so the
      // React Navigation default branch matches the custom bar's
      // `styles.tabLabel.fontSize` instead of falling back to RN's
      // platform default (~10 dp on iOS).
      tabBarLabelStyle: { fontSize: 12 },
      headerShown: false,
      tabBarActiveTintColor: activeColor,
      tabBarInactiveTintColor: inactiveColor,
      tabBarShowLabel: showLabelsResolved,
    }),
    [tabBarStyle, activeColor, inactiveColor, showLabelsResolved],
  );

  if (usesCustomBar) {
    // For transparent/blur surface variants, set tabBarStyle.height to 0 in
    // the Tab.Navigator screenOptions.  React Navigation's getTabBarHeight()
    // reads this to compute the bottom inset it provides to each screen via
    // BottomTabBarHeightContext.  When the height is 0, screens fill to the
    // very bottom of the viewport — content then shows through our
    // absolutely-positioned transparent/blur bar (iOS frosted-glass style).
    // Without this, screens stop ~49 dp above the bottom (the default tabBar
    // height) and the transparent bar just reveals the screen's empty
    // background rather than live content.
    const isTransparentSurface =
      tabBarStyleVariant === 'transparent' || tabBarStyleVariant === 'blur';
    const customBarScreenOptions = {
      headerShown: false,
      tabBarStyle: isTransparentSurface
        ? {
            height: 0 as const,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
          }
        : undefined,
      tabBarLabelStyle: { fontSize: 12 },
    };
    return (
      <Tab.Navigator
        initialRouteName={initialRouteName}
        tabBar={renderCustomBar}
        screenOptions={customBarScreenOptions as any}
      >
        {tabs.map((tab) => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.component}
          />
        ))}
      </Tab.Navigator>
    );
  }

  // Default path — react-navigation's built-in tab bar. Behaviour identical
  // to the pre-variants generator output, so legacy apps regenerate clean.
  return (
    <Tab.Navigator
      id={undefined}
      initialRouteName={initialRouteName}
      screenOptions={screenOptions}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarIcon: makeTabBarIcon(tab),
            tabBarLabel: tab.title,
            tabBarItemStyle:
              typeof tab.tabStyle === 'object' ? tab.tabStyle : undefined,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  barLayoutWrapper: {
    overflow: 'visible',
  },
  barContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'visible',
  },
  tabRow: {
    flexDirection: 'row',
    flex: 1,
  },
  centerAction: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ASBottomTabNavigation;
