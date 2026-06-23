import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Define the component with customizable props
interface DecrementIconProps {
  color?: string;
  size?: number;
}

const DecrementIcon: React.FC<DecrementIconProps> = ({
  color = '#000',
  size = 24,
}) => {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M5 12h14'
        stroke={color}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  );
};

export { DecrementIcon };
