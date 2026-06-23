import React from 'react';
import { View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

type HorizontalLineProps = {
  color: string;
  width: number | string;
  height: number;
};

const HorizontalLine: React.FC<HorizontalLineProps> = ({
  color,
  width,
  height,
}) => {
  return (
    <View>
      <Svg height={height} width={width}>
        <Line
          x1='0'
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={color}
          strokeWidth={height}
        />
      </Svg>
    </View>
  );
};

export { HorizontalLine };
