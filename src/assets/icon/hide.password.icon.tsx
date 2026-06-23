import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ColorValue } from 'react-native';
const HidePasswordIcon = (props: {
  size?: number;
  color: ColorValue | undefined;
  strokeWidth?: number;
}) => {
  const { size = 24, color, strokeWidth = 2 } = props;

  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0'
        stroke={color}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
      />
      <Path
        d='M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6'
        stroke={color}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export { HidePasswordIcon };
