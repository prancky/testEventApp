import React, { memo, ReactNode, useEffect, useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native';
import ASText from '../ASText';

import ASButton from '../ASButton';
import CustomIcon from '../CustomIcon';

type FloatingButtonPosition = ViewStyle;

export type ASFloatingActionButtonProps = {
  label?: string;
  textStyle?: TextStyle;
  style?: StyleProp<ViewStyle>;
  icon?: ReactNode | string;
  iconSize?: number;
  iconColor?: string;
  onPress: (event: GestureResponderEvent) => void | undefined;
  floatingPosition:
    | 'bottom-right'
    | 'bottom-center'
    | 'bottom-left'
    | 'center-left'
    | 'center-center'
    | 'center-right'
    | 'top-right'
    | 'top-center'
    | 'top-left';
  testId?: string;
  iconStyle?: ViewStyle;
  iconStyles?: ViewStyle;
};

const VERTICAL_POSITION = 30;
const HORIZONTAL_POSITION = 20;

const ASFloatingActionButton: React.FC<ASFloatingActionButtonProps> = (
  props: ASFloatingActionButtonProps,
) => {
  const {
    style,
    label,
    textStyle,
    icon,
    onPress,
    floatingPosition,
    testId = 'ASFloatingActionButton',
    iconSize,
    iconColor,
    iconStyle,
    iconStyles,
    ...restProps
  } = props;
  const resolvedIconStyle = iconStyles ?? iconStyle;
  const [floatingButtonPosition, setFloatingButtonPosition] =
    useState<FloatingButtonPosition | null>(null);
  const [widgetSize, setWidgetSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    calculatePosition();
    return () => {};
  }, [floatingPosition, widgetSize]);

  const calculatePosition = () => {
    const [verticalPosition, horizontalPosition] = (
      floatingPosition ?? ''
    ).split('-');
    let vPosition: FloatingButtonPosition = {};
    let hPosition: FloatingButtonPosition = {};
    switch (verticalPosition) {
      case 'top':
      case 'bottom':
        vPosition = { [verticalPosition]: VERTICAL_POSITION };
        break;
      case 'center':
        vPosition = { top: '50%', transform: [{ translateY: -50 }] };
        break;
    }
    switch (horizontalPosition) {
      case 'left':
      case 'right':
        hPosition = { [horizontalPosition]: HORIZONTAL_POSITION };
        break;
      case 'center':
        hPosition = {
          left: '50%',
          transform: [
            { translateX: -(widgetSize?.width / 2) },
            ...(vPosition.transform ? vPosition.transform : []),
          ],
        };
        break;
    }
    setFloatingButtonPosition({ ...vPosition, ...hPosition });
  };

  if (!floatingButtonPosition || (!icon && !label)) return null;

  const renderIcon = () => {
    return (
      <CustomIcon
        icon={icon}
        size={iconSize}
        color={iconColor}
        style={label ? resolvedIconStyle : {}}
      />
    );
  };

  return (
    <ASButton
      testId={`${testId}`}
      onLayout={(event: LayoutChangeEvent) =>
        setWidgetSize({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height,
        })
      }
      style={[
        { ...floatingButtonPosition },
        {
          ...(label && {
            flexDirection: 'row',
            aspectRatio: undefined,
            width: 'auto',
            height: 'auto',
          }),
        },
        style,
      ]}
      onPress={onPress}
      {...restProps}
    >
      {renderIcon()}
      {!!label && (
        <ASText testId={`label-${testId}`} style={textStyle}>
          {label}
        </ASText>
      )}
    </ASButton>
  );
};

const styles = StyleSheet.create({});

export default memo(ASFloatingActionButton);
