import React from 'react';
import {
  Image,
  View,
  ImageStyle,
  TextStyle,
  ViewStyle,
  Platform,
} from 'react-native';
import ASText from '../ASText';
import { toNumber } from '../../utils/common.utils';
import glyphMap from '../../assets/fonts/materialIconsGlyphmap.json';

export interface CustomIconProps {
  icon?: string | React.ReactNode;
  size?: number | string;
  color?: string;
  style?: ImageStyle | TextStyle | ViewStyle;
  testId?: string;
  accessibilityLabel?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
}

const isUrlOrBase64 = (s: string) =>
  s.startsWith('data:') || /^https?:\/\//i.test(s);

const isSvgUrl = (s: string) =>
  s.startsWith('data:image/svg') || /\.svg(\?|#|$)/i.test(s);

const tintStyle = (c?: string) =>
  c !== undefined && c !== null ? { tintColor: c } : {};

const resolveIconContent = (icon: string): string => {
  const codepoint =
    (glyphMap as Record<string, number>)[icon.replaceAll('_', '-')] ??
    (glyphMap as Record<string, number>)[icon];
  if (codepoint) return String.fromCodePoint(codepoint);
  return icon;
};

const CustomIcon: React.FC<CustomIconProps> = ({
  icon,
  size,
  color,
  style = {},
  testId,
  accessibilityLabel,
  crossOrigin,
}) => {
  if (!icon) return null;

  const numericSize = size ? toNumber(size) : 0;

  if (typeof icon !== 'string') {
    return (
      <View
        style={{
          width: numericSize,
          height: numericSize,
          ...(style as ViewStyle),
        }}
      >
        {icon}
      </View>
    );
  }

  if (isUrlOrBase64(icon) && Platform.OS === 'web') {
    return (
      <View
        style={{
          width: numericSize,
          height: numericSize,
          overflow: 'visible' as const,
          ...(style as ViewStyle),
        }}
      >
        {React.createElement('img', {
          src: icon,
          style: {
            width: numericSize,
            height: numericSize,
            ...(isSvgUrl(icon) ? tintStyle(color) : {}),
          },
          crossOrigin,
        })}
      </View>
    );
  }

  if (isUrlOrBase64(icon)) {
    return (
      <Image
        source={{ uri: icon }}
        style={{
          width: numericSize,
          height: numericSize,
          overflow: 'visible',
          ...(isSvgUrl(icon) ? tintStyle(color) : {}),
          ...(style as ImageStyle),
        }}
        crossOrigin={crossOrigin}
      />
    );
  }

  const isMaterialIcon = icon.length <= 2 || /^[a-z0-9_]+$/.test(icon);

  const materialFontFamily = Platform.select({
    ios: 'Material Icon',
    default: 'MaterialIcon',
  });

  const fontFamily = isMaterialIcon ? materialFontFamily : undefined;

  const iconContent = isMaterialIcon ? resolveIconContent(icon) : '?';

  return (
    <View
      style={{
        width: numericSize,
        height: numericSize,
        overflow: 'visible',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ASText
        style={{
          fontSize: numericSize === 0 ? 1 : numericSize,
          fontFamily,
          fontWeight: 'normal',
          lineHeight: numericSize === 0 ? undefined : numericSize,
          color,
          ...(style as TextStyle),
        }}
        accessibilityLabel={accessibilityLabel || 'icon'}
      >
        {iconContent}
      </ASText>
    </View>
  );
};

export default CustomIcon;
