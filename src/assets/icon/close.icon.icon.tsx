import * as React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

const CloseIcon = (props: SvgProps) => (
  <Svg width={30} height={30} viewBox='0 0 24 24' fill='none'>
    <Path
      id='Vector'
      d='M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18'
      stroke='#000000'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Svg>
);

export { CloseIcon };
