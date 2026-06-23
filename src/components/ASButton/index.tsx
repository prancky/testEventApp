import React, { useState } from 'react';
import {
  GestureResponderEvent,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import ASText from '../ASText';
import LoadingIndicator from '../ASLoadingIndicator';
import {
  useIsTimeoutLoading,
  getPlatformShadowStyle,
} from '../../utils/common.utils';
import ASImage from '../ASImage';
import CustomIcon from '../CustomIcon';

import LinearGradient from 'react-native-linear-gradient';

type ButtonIcon = React.ComponentProps<typeof CustomIcon>['icon'];
type ButtonTextStyle = TextStyle | TextStyle[];

export type ASButtonProps = TouchableOpacityProps & {
  label?: string;
  onPress: (event: GestureResponderEvent) => void | undefined;
  style?: ViewStyle | ViewStyle[];
  textStyle?: ButtonTextStyle;
  disabled?: boolean;
  children?: React.ReactNode;
  simpleTextButton?: boolean;
  loading?: boolean;
  testId?: string;
  icon?: ButtonIcon;
  iconStyles?: ViewStyle;
  leadingIconStyles?: ViewStyle;
  trailingIconStyles?: ViewStyle;
  iconPosition?: 'leading' | 'trailing';
  backgroundImage?: string;
};

const ASButton: React.FC<ASButtonProps> = (props: ASButtonProps) => {
  const {
    label = '',
    style,
    textStyle,
    onPress,
    disabled,
    children,
    simpleTextButton,
    loading,
    testId: _testId = 'ASButton',
    testID,
    icon,
    iconStyles,
    iconPosition,
    backgroundImage,
    leadingIconStyles,
    trailingIconStyles,
    disabledBackgroundColor,
    disabledTextColor,
    ...restProps
  } = props;
  const isTimeout = useIsTimeoutLoading(60000, loading);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const flattenedStyle: ViewStyle = StyleSheet.flatten(style) || {}; // Ensure that style is a single object

  // Extract gradient properties from style
  const {
    gradientType: _gradientType,
    gradientColors: _gradientColors,
    gradientStops: _gradientStops,
    gradientStart: _gradientStart,
    gradientEnd: _gradientEnd,
  }: ViewStyle & Record<string, unknown> = flattenedStyle || {};
  const hasGradient =
    Array.isArray(_gradientColors) && _gradientColors.length >= 2;

  // When children are present (card/container usage), strip the fixed height so
  // minHeight can take effect and the container can expand to fit content on native.
  const { height: _strippedHeight, ...flattenedStyleWithoutHeight } =
    flattenedStyle || {};
  const effectiveStyle = children
    ? flattenedStyleWithoutHeight
    : flattenedStyle;
  const flattenedTextStyle = StyleSheet.flatten(textStyle); // Ensure that textStyle is a single object
  const testId = testID || _testId;

  // Get platform-specific shadow style from flattened style
  const platformShadowStyle = getPlatformShadowStyle(flattenedStyle);

  const getButtonBackgroundColor = () => {
    if (disabled) return disabledBackgroundColor;
    if (simpleTextButton) return 'transparent';
    return flattenedStyle.backgroundColor;
  };

  const getButtonTextColor = () => {
    if (disabled) return disabledTextColor;
    return flattenedTextStyle.color;
  };

  const getCalculatedHeight = () => {
    const { height, minHeight, maxHeight } = flattenedStyle || {};

    // If only minHeight and/or maxHeight are set (no explicit height),
    // return undefined to allow them to work naturally
    // minHeight sets minimum, maxHeight restricts maximum, content can flow between
    if (height === undefined) {
      return undefined;
    }

    // If explicit height is set, calculate based on min/max constraints
    let calculatedHeight = height;

    // Apply minHeight: if minHeight > height, use minHeight
    if (minHeight !== undefined && minHeight > height) {
      calculatedHeight = minHeight;
    }

    // Apply maxHeight: if maxHeight < calculatedHeight, use maxHeight
    if (maxHeight !== undefined && maxHeight < calculatedHeight) {
      calculatedHeight = maxHeight;
    }

    return calculatedHeight;
  };

  const renderIcon = () => {
    if (!icon) return undefined;

    const { iconSize, color, ...restIconStyles } = iconStyles || {};
    const positionStyles =
      iconPosition === 'leading' ? leadingIconStyles : trailingIconStyles;

    return (
      <CustomIcon
        icon={icon}
        size={iconSize}
        color={color}
        style={{ ...positionStyles, ...restIconStyles }}
      />
    );
  };

  return (
    <TouchableOpacity
      {...restProps}
      disabled={disabled}
      onPress={onPress}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setDimensions({ width, height });
        // Call parent's onLayout if provided
        restProps.onLayout?.(event);
      }}
      style={[
        effectiveStyle,
        {
          backgroundColor: getButtonBackgroundColor(),
          overflow: loading ? 'hidden' : flattenedStyle?.overflow || 'visible',
          // When children are present (card/container usage), use minHeight so content
          // can expand naturally on native iOS/Android instead of being clipped.
          ...(getCalculatedHeight() !== undefined &&
            (children
              ? { minHeight: getCalculatedHeight() }
              : { height: getCalculatedHeight() })),
          // Keep minHeight and maxHeight so they work as intended
          // minHeight allows expansion, maxHeight restricts it
        },
        platformShadowStyle,
      ]}
      testID={`button-${testId}`}
    >
      {hasGradient && (
        <LinearGradient
          colors={_gradientColors}
          {...(_gradientStops ? { locations: _gradientStops } : {})}
          {...(_gradientStart ? { start: _gradientStart } : {})}
          {...(_gradientEnd ? { end: _gradientEnd } : {})}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: flattenedStyle?.borderRadius },
          ]}
        />
      )}
      {backgroundImage && (
        <ASImage
          testID={`${testId}-BackgroundImage`}
          source={backgroundImage}
          style={[styles.backgroundStyle, { height: dimensions?.height }]}
          resizeMode='stretch' // Ensure image covers the entire area
        />
      )}
      {children || (
        <View style={styles.labelWrapper}>
          {iconPosition === 'leading' && renderIcon()}
          <ASText
            testID={`label-${testId}`}
            numberOfLines={1}
            style={[
              flattenedTextStyle, // Flattened user-provided styles
              {
                color: getButtonTextColor(),
              },
            ]}
          >
            {label}
          </ASText>
          {iconPosition === 'trailing' && renderIcon()}
        </View>
      )}
      {loading && !isTimeout && (
        <View
          testID={`loadingView-${testId}`}
          style={[
            styles.overlayContainer,
            StyleSheet.absoluteFillObject,
            { ...dimensions },
          ]}
        >
          <LoadingIndicator
            testID={`loadingIndicator-${testId}`}
            color={'#D1D5DB'}
            loading={loading}
            style={styles.overlayLoadingIndicator}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loadingIndicator: {
    marginLeft: 10,
    height: 16,
    width: 16,
    position: 'absolute',
    right: -28,
  },
  labelWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  overlayContainer: {
    position: 'absolute',
    backgroundColor: '#231F2080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayLoadingIndicator: {
    height: 16,
    width: 16,
  },
  backgroundStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%', // Fill the entire width of the parent
    zIndex: -1, // Ensure the background image is behind other elements
  },
});

export default ASButton;
