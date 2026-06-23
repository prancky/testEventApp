import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ColorValue } from 'react-native';
const ShowPasswordIcon = (props: {
  size?: number;
  color: ColorValue | undefined;
  strokeWidth?: number;
}) => {
  const { size = 24, strokeWidth = 2, color } = props;

  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M10.585 10.587a2 2 0 0 0 2.829 2.828'
        stroke={color}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
      />
      <Path
        d='M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87'
        stroke={color}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
      />
      <Path
        d='M3 3l18 18'
        stroke={color}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export { ShowPasswordIcon };
