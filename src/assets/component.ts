import { color } from './color';
import { radius } from './radius';
import { space } from './space';

export const component = {
  input: {
    padding: {
      x: space['3'],
      y: space['3'],
    },
    border: {
      default: color.border.default,
      focus: color.border.strong,
      disabled: color.border.disabled,
      error: color.status.danger,
    },
    placeholder: color.text.tertiary,
    height: 44,
    text: color.text.primary,
    radius: radius.sm,
    background: color.surface.default,
  },
  button: {
    text: {
      color: color.brand.onPrimary,
      disabled: color.text.disabled,
    },
    background: {
      disabled: color.surface.disabled,
      color: color.brand.primary,
    },
    border: color.border.default,
    height: 44,
    radius: radius.md,
  },
  dropdown: {
    selectedText: {
      color: '#EAEAEA',
    },
  },
  icon: {
    size: {
      lg: 24,
      md: 20,
      sm: 16,
    },
  },
};
