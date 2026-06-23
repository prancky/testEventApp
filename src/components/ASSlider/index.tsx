import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Platform,
  ViewStyle,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { useField } from 'formik';

import { getPlatformShadowStyle } from '../../utils/common.utils';

// Types
type SliderTop = ViewStyle['top'];
type SliderWidth = ViewStyle['width'];
type SliderHeight = ViewStyle['height'];
type SliderNativeTransform = ViewStyle['transform'];
type SliderTransform = SliderNativeTransform | React.CSSProperties['transform'];

export type SliderTrackStyles = {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  activeBackgroundColor?: string;
  inactiveBackgroundColor?: string;
  position?: 'absolute' | 'relative';
  transform?: SliderTransform;
  top?: number | string;
};

export type SliderThumbStyles = {
  size?: number;
  borderRadius?: number;
  backgroundColor?: string;
  position?: 'absolute' | 'relative';
  transform?: SliderTransform;
  top?: number | string;
};

export type ASSliderProps = {
  onChange?: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  name: string;
  step?: number;
  testId?: string;
  sliderTrackStyles?: SliderTrackStyles;
  sliderThumbStyles?: SliderThumbStyles;
  style?: ViewStyle;
  disabled?: boolean;
};

type ASSliderWebProps = {
  testId: string;
  style?: ViewStyle;
  disabled: boolean;
  minimumValue: number;
  maximumValue: number;
  step: number;
  handleValueChange: (value: number) => void;
  percentValue: number;
  trackWidth: number | string;
  trackHeight: number | string;
  trackBorderRadius: number;
  activeTrackColor?: string;
  inactiveTrackColor?: string;
  trackPosition?: 'absolute' | 'relative';
  trackTop?: number | string;
  trackTransform?: SliderTransform;
  thumbSize: number;
  thumbBorderRadius: number;
  thumbBackgroundColor?: string;
  platformShadowStyle: ViewStyle;
};

// Default values
const DEFAULT_TRACK_HEIGHT = 6;
const DEFAULT_TRACK_BORDER_RADIUS = 3;
const DEFAULT_THUMB_SIZE = 20;

const ASSliderWeb: React.FC<ASSliderWebProps> = ({
  testId,
  style,
  disabled,
  minimumValue,
  maximumValue,
  step,
  handleValueChange,
  percentValue,
  trackWidth,
  trackHeight,
  trackBorderRadius,
  activeTrackColor,
  inactiveTrackColor,
  trackPosition,
  trackTop,
  trackTransform,
  thumbSize,
  thumbBorderRadius,
  thumbBackgroundColor,
  platformShadowStyle,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const updateValueFromClientX = useCallback(
    (clientX: number) => {
      if (!trackRef.current || disabled) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      let value = minimumValue + percentage * (maximumValue - minimumValue);
      if (step > 0) {
        value = Math.round(value / step) * step;
      }
      value = Math.max(minimumValue, Math.min(maximumValue, value));
      handleValueChange(value);
    },
    [disabled, minimumValue, maximumValue, step, handleValueChange],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      updateValueFromClientX(e.clientX);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [updateValueFromClientX]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'pointer';
    updateValueFromClientX(e.clientX);
  };

  // Current value derived from the rendered fill percentage, used for the
  // slider's ARIA value and keyboard stepping.
  const currentValue =
    minimumValue + (percentValue / 100) * (maximumValue - minimumValue);

  // Keyboard support so the slider satisfies the WAI-ARIA slider pattern
  // (arrow keys step, Home/End jump to bounds) and is reachable via Tab.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const stepSize = step > 0 ? step : 1;
    let next: number;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      next = currentValue + stepSize;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      next = currentValue - stepSize;
    } else if (e.key === 'Home') {
      next = minimumValue;
    } else if (e.key === 'End') {
      next = maximumValue;
    } else {
      return;
    }
    e.preventDefault();
    handleValueChange(Math.max(minimumValue, Math.min(maximumValue, next)));
  };

  // Web styles
  const webTrackStyle: React.CSSProperties = {
    position: 'relative',
    width: trackWidth,
    height: trackHeight,
    borderRadius: trackBorderRadius,
    backgroundColor: inactiveTrackColor,
    cursor: disabled ? 'default' : 'pointer',
    ...(trackPosition && { position: trackPosition }),
    ...(trackTop !== undefined && { top: trackTop }),
    ...(trackTransform && {
      transform: trackTransform as React.CSSProperties['transform'],
    }),
  };

  const webActiveTrackStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: `${percentValue}%`,
    borderRadius: trackBorderRadius,
    backgroundColor: activeTrackColor,
    pointerEvents: 'none',
  };

  const webThumbStyle: React.CSSProperties = {
    position: 'absolute',
    width: thumbSize,
    height: thumbSize,
    borderRadius: thumbBorderRadius,
    backgroundColor: thumbBackgroundColor,
    top: '50%',
    left: `${percentValue}%`,
    transform: 'translate(-50%, -50%)',
    cursor: disabled ? 'default' : 'grab',
    boxShadow: '0 0 2px rgba(0,0,0,0.3)',
    pointerEvents: 'none',
  };

  return (
    <View testID={testId} style={[style, { minHeight: webThumbStyle?.height }]}>
      <div
        ref={trackRef}
        data-testid={`track-${testId}`}
        role='slider'
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={minimumValue}
        aria-valuemax={maximumValue}
        aria-valuenow={currentValue}
        aria-disabled={disabled}
        style={{ ...webTrackStyle, ...platformShadowStyle }}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
      >
        <div style={webActiveTrackStyle} />
        <div data-testid={`thumb-${testId}`} style={webThumbStyle} />
      </div>
    </View>
  );
};

const ASSlider: React.FC<ASSliderProps> = ({
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  name,
  onChange,
  testId = 'ASSlider',
  sliderTrackStyles,
  sliderThumbStyles,
  style,
  disabled = false,
}) => {
  const [field, , helpers] = useField(name);
  const platformShadowStyle = getPlatformShadowStyle(sliderTrackStyles);

  const { setValue } = helpers || {};

  const trackWidthRef = useRef(0);
  const trackPageXRef = useRef(0);

  // Parse slider value
  const sliderValue = Number.isNaN(Number.parseFloat(field?.value))
    ? minimumValue
    : Number.parseFloat(field?.value);

  // Extract track styles with defaults
  const trackWidth = sliderTrackStyles?.width ?? '100%';
  const trackHeight = sliderTrackStyles?.height ?? DEFAULT_TRACK_HEIGHT;
  const trackBorderRadius =
    sliderTrackStyles?.borderRadius ?? DEFAULT_TRACK_BORDER_RADIUS;
  const activeTrackColor = sliderTrackStyles?.activeBackgroundColor;
  const inactiveTrackColor = sliderTrackStyles?.inactiveBackgroundColor;
  const trackPosition = sliderTrackStyles?.position;
  const trackTransform = sliderTrackStyles?.transform;
  const trackTop = sliderTrackStyles?.top;

  // Extract thumb styles with defaults
  const thumbSize = sliderThumbStyles?.size ?? DEFAULT_THUMB_SIZE;
  const thumbBorderRadius = sliderThumbStyles?.borderRadius ?? thumbSize / 2;
  const thumbBackgroundColor = sliderThumbStyles?.backgroundColor;
  const thumbPosition = sliderThumbStyles?.position;
  const thumbTransform = sliderThumbStyles?.transform;
  const thumbTop = sliderThumbStyles?.top;

  // Calculate percentage from value
  const calculatePercentage = (value: number): number => {
    if (maximumValue === minimumValue) return 0;
    const percentage =
      ((value - minimumValue) / (maximumValue - minimumValue)) * 100;
    return Math.max(0, Math.min(100, percentage));
  };

  // Calculate value from position
  const calculateValue = useCallback(
    (positionX: number): number => {
      if (trackWidthRef.current === 0) return minimumValue;
      const percentage = Math.max(
        0,
        Math.min(1, positionX / trackWidthRef.current),
      );
      let value = minimumValue + percentage * (maximumValue - minimumValue);
      if (step > 0) {
        value = Math.round(value / step) * step;
      }
      return Math.max(minimumValue, Math.min(maximumValue, value));
    },
    [minimumValue, maximumValue, step],
  );

  // Handle value change
  const handleValueChange = useCallback(
    (value: number) => {
      setValue?.(value);
      onChange?.(value);
    },
    [setValue, onChange],
  );

  // Use refs to avoid stale closures in PanResponder
  const calculateValueRef = useRef(calculateValue);
  const handleValueChangeRef = useRef(handleValueChange);
  useEffect(() => {
    calculateValueRef.current = calculateValue;
    handleValueChangeRef.current = handleValueChange;
  }, [calculateValue, handleValueChange]);

  const percentValue = calculatePercentage(sliderValue);

  // Handle track layout to get width and position
  const onTrackLayout = (event: LayoutChangeEvent) => {
    trackWidthRef.current = event.nativeEvent.layout.width;
  };

  // PanResponder for drag handling (native only)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (evt) => {
        // Store track's page position and use locationX for initial tap
        trackPageXRef.current =
          evt.nativeEvent.pageX - evt.nativeEvent.locationX;
        const newValue = calculateValueRef.current(evt.nativeEvent.locationX);
        handleValueChangeRef.current(newValue);
      },
      onPanResponderMove: (_evt, gestureState) => {
        // Use moveX (absolute screen position) minus track's left offset
        // This avoids the locationX issue on Android where it reports
        // coordinates relative to whichever child view the finger is over
        const positionX = gestureState.moveX - trackPageXRef.current;
        const newValue = calculateValueRef.current(positionX);
        handleValueChangeRef.current(newValue);
      },
    }),
  ).current;

  if (Platform.OS === 'web') {
    return (
      <ASSliderWeb
        testId={testId}
        style={style}
        disabled={disabled}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        handleValueChange={handleValueChange}
        percentValue={percentValue}
        trackWidth={trackWidth}
        trackHeight={trackHeight}
        trackBorderRadius={trackBorderRadius}
        activeTrackColor={activeTrackColor}
        inactiveTrackColor={inactiveTrackColor}
        trackPosition={trackPosition}
        trackTop={trackTop}
        trackTransform={trackTransform}
        thumbSize={thumbSize}
        thumbBorderRadius={thumbBorderRadius}
        thumbBackgroundColor={thumbBackgroundColor}
        platformShadowStyle={platformShadowStyle}
      />
    );
  }

  // Native styles
  const nativeTrackContainerStyle: ViewStyle = {
    position: 'relative',
    width: trackWidth as SliderWidth,
    height: trackHeight as SliderHeight,
    justifyContent: 'center',
    ...(trackPosition && { position: trackPosition }),
    ...(trackTop !== undefined && { top: trackTop as SliderTop }),
    ...(trackTransform && {
      transform: trackTransform as SliderNativeTransform,
    }),
  };

  const nativeInactiveTrackStyle: ViewStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    height: trackHeight as SliderHeight,
    borderRadius: trackBorderRadius,
    backgroundColor: inactiveTrackColor,
  };

  const nativeActiveTrackStyle: ViewStyle = {
    position: 'absolute',
    left: 0,
    width: `${percentValue}%` as SliderWidth,
    height: trackHeight as SliderHeight,
    borderRadius: trackBorderRadius,
    backgroundColor: activeTrackColor,
  };

  const nativeThumbStyle: ViewStyle = {
    position: 'absolute',
    width: thumbSize,
    height: thumbSize,
    borderRadius: thumbBorderRadius,
    backgroundColor: thumbBackgroundColor,
    left: `${percentValue}%` as ViewStyle['left'],
    top: '50%',
    transform: [{ translateX: -thumbSize / 2 }, { translateY: -thumbSize / 2 }],
    ...(thumbPosition && { position: thumbPosition }),
    ...(thumbTop !== undefined && { top: thumbTop as SliderTop }),
    ...(thumbTransform && {
      transform: thumbTransform as SliderNativeTransform,
    }),
  };

  return (
    <View testID={testId} style={[style, { minHeight: thumbSize }]}>
      <View
        testID={`track-container-${testId}`}
        style={nativeTrackContainerStyle}
        onLayout={onTrackLayout}
        {...panResponder.panHandlers}
      >
        <View
          testID={`inactive-track-${testId}`}
          style={{ ...nativeInactiveTrackStyle, ...platformShadowStyle }}
        />
        <View
          testID={`active-track-${testId}`}
          style={nativeActiveTrackStyle}
        />
        <View testID={`thumb-${testId}`} style={nativeThumbStyle} />
      </View>
    </View>
  );
};

export default ASSlider;
