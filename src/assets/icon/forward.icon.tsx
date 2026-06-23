import React from 'react';
import Svg, { Line, Path } from 'react-native-svg';
import { ColorValue } from 'react-native';
const ForwardIcon = (props: {
  size?: number;
  color: ColorValue | undefined;
}) => {
  const { size = 26, color } = props;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill='none'>
      <Path
        d='M14.7827 5L21.4998 12L14.7827 19'
        stroke={color}
        stroke-width='2'
        stroke-linecap='round'
        stroke-linejoin='round'
      />
      <Line
        x1='20.2329'
        y1='12.0317'
        x2='4.49985'
        y2='12.0317'
        stroke={color}
        stroke-width='2'
        stroke-linecap='round'
      />
    </Svg>
  );
};

export { ForwardIcon };
