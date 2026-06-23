import { createThemeData } from '../context';

import { color } from './color';

import { space } from './space';

import { component } from './component';

import { border } from './border';

import { radius } from './radius';

import { typography } from './typography';

import { text } from './text';

import { effect } from './effect';

const themeData = createThemeData({
  color: color,

  space: space,

  component: component,

  border: border,

  radius: radius,

  typography: typography,

  text: text,

  effect: effect,
});

export default themeData;
