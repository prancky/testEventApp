export const constants = {
  defaultPlaceholderColor: '#707070',
};

// Dynamic color type - accepts nested color objects from SDK theme data
// e.g., { text: { primary: '#111827' }, brand: { primary: '#FBBF2D' }, surface: { default: '#FFF' } }
export type ThemeColorValue = string | ThemeColorProps;

export type ThemeColorProps = {
  [key: string]: ThemeColorValue;
};
