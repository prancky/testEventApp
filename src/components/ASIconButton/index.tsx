import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  StyleSheet,
  StyleProp,
} from 'react-native';
import { getPlatformShadowStyle } from '../../utils/common.utils';
import CustomIcon from '../CustomIcon';

export type ASIconButtonProps = TouchableOpacityProps & {
  onPress: () => void;
  width?: number;
  height?: number;
  size?: number;
  iconColor?: string;
  icon: React.ComponentProps<typeof CustomIcon>['icon'];
  crossOrigin?: 'anonymous' | 'use-credentials';
  id?: string;
  style?: StyleProp<ViewStyle>;
  testId?: string;
};

const ASIconButton: React.FC<ASIconButtonProps> = (
  props: ASIconButtonProps,
) => {
  const {
    onPress,
    width,
    height,
    size,
    icon,
    crossOrigin,
    id,
    style,
    testId = 'ASIconButton',
    iconColor,
  } = props;

  // Get platform-specific shadow style from flattened style
  const flattenedStyle = StyleSheet.flatten(style);
  const platformShadowStyle = getPlatformShadowStyle(flattenedStyle);

  // Derive icon size from explicit props, falling back to style dimensions
  const styleWidth = flattenedStyle?.width;
  const iconWidth =
    width ??
    height ??
    size ??
    (typeof styleWidth === 'number' ? styleWidth : undefined);
  const resolvedIcon = icon;

  const renderIcon = () => {
    return (
      <CustomIcon
        icon={resolvedIcon}
        size={iconWidth}
        color={iconColor}
        crossOrigin={crossOrigin}
      />
    );
  };

  return (
    <TouchableOpacity
      testID={`view-${testId}`}
      onPress={onPress}
      style={[
        styles.button,
        style,
        platformShadowStyle,
        { overflow: 'visible' },
      ]}
      id={id}
    >
      {renderIcon()}
    </TouchableOpacity>
  );
};

export default ASIconButton;

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
});
