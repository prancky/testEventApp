import * as React from 'react';
import { ColorValue } from 'react-native';
import Svg, { Path } from 'react-native-svg';
const ArrowForwardIcon = (props: { size?: number; color?: ColorValue }) => {
  const { size = 26, color } = props;

  return (
    <Svg
      width={size}
      height={24}
      fill={color}
      viewBox='0 -960 960 960'
      {...props}
    >
      <Path d='M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z' />
    </Svg>
  );
};

export { ArrowForwardIcon };
