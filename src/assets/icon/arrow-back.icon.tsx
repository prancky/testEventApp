import * as React from 'react';
import { ColorValue } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useThemeColors } from '../../context/ThemeContext';

const ArrowBackIcon = (props: {
  size?: number;
  color: ColorValue | undefined;
}) => {
  const colors = useThemeColors();
  const { size = 24, color = colors.brand.primary } = props;

  return (
    <Svg width={size} height={size} fill='none' viewBox='0 0 512 512'>
      <Path
        stroke={color}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={48}
        d='M244 400L100 256l144-144M120 256h292'
      />
    </Svg>
  );
};

export { ArrowBackIcon };
