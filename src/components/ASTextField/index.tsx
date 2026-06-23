import React, {
  ReactNode,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import {
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
  Platform,
} from 'react-native';
import {
  TextInputMask,
  TextInputMaskProps,
  TextInputMaskTypeProp,
} from 'react-native-masked-text';
import { useField } from 'formik';
import ASText from '../ASText';
import { ThemeContext } from '../../context/ThemeContext';
import { constants } from '../../utils/constants';
import ASOverlay from '../ASOverlay';

import { toNumber, getPlatformShadowStyle } from '../../utils/common.utils';
import CustomIcon from '../CustomIcon';

type TextFieldIcon = React.ComponentProps<typeof CustomIcon>['icon'];
type TextFieldIconStyle = ViewStyle & {
  iconSize?: number | string;
  color?: string;
};

export type ASTextFieldProps = Omit<TextInputMaskProps, 'type'> &
  TextInputProps & {
    name: string;
    prefixIcon?: ReactNode | string;
    prefixIconStyles: StyleProp<ViewStyle>;
    suffixIcon?: ReactNode | string;
    suffixIconStyles: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    formatError?: (error: string) => string;
    label?: string;
    textFieldType?: TextInputMaskTypeProp;
    formatNumber?: 'comma' | 'dot' | 'percentage';
    prefixText?: string;
    prefixTextStyle?: StyleProp<TextStyle>;
    labelTextStyle?: TextStyle;
    inputTextStyle?: StyleProp<TextStyle>;
    errorMessageTextStyle?: StyleProp<TextStyle>;
    placeholderTextStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    borderErrorColor?: string;
    borderActiveColor?: string;
    placeholderTextColor?: string;
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
    isOverlayEnabled?: boolean;
    id?: string;
    onChange?: (text: string) => void;
    testId?: string;
    multiline?: boolean;
    numberOfLines?: number;
    maxNumberOfLines?: number;
    defaultValue?: string;
    autoFocus?: boolean;
  };

const formatters: Record<string, (t: string, n: number) => string> = {
  comma: (t) =>
    Number.parseFloat(t.replace(',', '')).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  dot: (t) =>
    Number.parseFloat(t.replace('.', '')).toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  percentage: (_t, n) => `${(n * 100).toFixed(2)}%`,
};

const capitalizers: Record<string, (s: string) => string> = {
  characters: (s) => s.toUpperCase(),
  words: (s) => s.replaceAll(/\b\w/g, (c) => c.toUpperCase()),
  sentences: (s) => s.replaceAll(/(^\w|\.\s+\w)/g, (c) => c.toUpperCase()),
};

const getMultilineWebStyles = (
  numberOfLines: number | undefined,
): ViewStyle | undefined => {
  if (!numberOfLines || Platform.OS !== 'web') return undefined;
  return {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    display: '-webkit-box',
    WebkitLineClamp: numberOfLines,
    WebkitBoxOrient: 'vertical',
  };
};

const getWrapperStyle = (
  customFlex: number | undefined,
  customWidth: number | string | undefined,
  customAlignSelf: string | undefined,
  customMinWidth: number | string | undefined,
): ViewStyle => {
  const style: ViewStyle = { height: 'auto', borderColor: 'transparent' };
  if (customFlex !== undefined) style.flex = customFlex;
  if (customWidth !== undefined) style.width = customWidth;
  if (customAlignSelf !== undefined) style.alignSelf = customAlignSelf;
  if (customMinWidth !== undefined) style.minWidth = customMinWidth;
  return style;
};

const IconView: React.FC<{
  icon: TextFieldIcon;
  iconStyles?: StyleProp<ViewStyle>;
}> = ({ icon, iconStyles }) => {
  const flattenedIconStyle: TextFieldIconStyle =
    StyleSheet.flatten(iconStyles) || {};
  const iconSize =
    flattenedIconStyle.iconSize ||
    flattenedIconStyle.width ||
    flattenedIconStyle.height ||
    22;
  const iconColor = flattenedIconStyle.color;

  if (React.isValidElement(icon)) {
    return React.cloneElement(
      icon as React.ReactElement<{ size?: number | string; color?: string }>,
      { size: iconSize, color: iconColor },
    );
  }

  return <CustomIcon icon={icon} size={iconSize} color={iconColor} />;
};

const ASTextField = (props: ASTextFieldProps) => {
  useContext(ThemeContext);
  const {
    name,
    onFocus,
    onBlur,
    suffixIcon,
    suffixIconStyles,
    prefixIcon,
    prefixText,
    prefixTextStyle,
    formatError,
    options,
    label,
    textFieldType = 'custom',
    formatNumber,
    labelTextStyle,
    inputTextStyle,
    borderErrorColor,
    borderActiveColor,
    style,
    errorMessageTextStyle,
    placeholderTextStyle,
    containerStyle,
    placeholderTextColor,
    accessibilityLabel,
    isOverlayEnabled,
    prefixIconStyles,
    maxNumberOfLines,
    id,
    onChange,
    testId = 'ASTextField',
    multiline,
    numberOfLines,
    defaultValue,
    autoFocus,
    contentContainerStyle,
    ...restProps
  } = props;
  const [active, setActive] = useState(false);
  const [field, meta, helpers] = useField(name);
  const showMask = options && Object.keys(options).length > 0;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (defaultValue && !field.value) {
      helpers.setValue(defaultValue);
    }
  }, []);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const flattenedStyle: ViewStyle = StyleSheet.flatten(style);
  const flattenedLabelStyle = StyleSheet.flatten(labelTextStyle) || {};
  const labelFontSize =
    flattenedLabelStyle.fontSize || styles.labelStyle?.fontSize;
  const labelTopPosition = -labelFontSize * 0.8;
  const flattenedHeight = flattenedStyle?.height || 44;

  const handleOnFocus = (
    event: NativeSyntheticEvent<TextInputFocusEventData>,
  ) => {
    setActive(true);
    if (onFocus) {
      onFocus(event);
    }
  };

  const handleFormat = () => {
    const text = field.value;
    const numberValue =
      typeof text === 'string' ? Number.parseFloat(text) : toNumber(text);
    const formatted =
      !Number.isNaN(numberValue) && formatNumber && formatters[formatNumber]
        ? formatters[formatNumber](text, numberValue)
        : field.value;
    field?.onChange(name)(formatted);
  };

  const handleOnBlur = (
    event: NativeSyntheticEvent<TextInputFocusEventData>,
  ) => {
    handleFormat();
    setActive(false);
    field?.onBlur(name);
    helpers?.setTouched(true);

    if (onBlur) {
      onBlur(event);
    }
  };

  const handleOnChange = (e: string) => {
    const cap = restProps.autoCapitalize;
    const processedValue =
      Platform.OS === 'web' && cap && e && capitalizers[cap as string]
        ? capitalizers[cap as string](e)
        : e;
    field?.onChange(name)(processedValue);
    onChange?.(processedValue);
  };

  const getErrorMessage = (error: string) => {
    return formatError?.(error) ?? error;
  };

  const getBorderColor = () => {
    if (meta.error && meta.touched) {
      return borderErrorColor;
    }
    return active ? borderActiveColor : flattenedStyle?.borderColor;
  };

  const flattenedInputStyle = StyleSheet.flatten(inputTextStyle);
  const fontSize = flattenedInputStyle?.fontSize || 14;
  const lineHeight = flattenedInputStyle?.lineHeight || fontSize * 1.53;

  const fixedHeight =
    multiline && numberOfLines ? numberOfLines * lineHeight + 10 : undefined;

  const {
    flex: customFlex,
    width: customWidth,
    alignSelf: customAlignSelf,
    minWidth: customMinWidth,
    ...restFlattenedStyle
  } = flattenedStyle || {};

  const flattenedInputTextStyle = StyleSheet.flatten(inputTextStyle);
  const {
    fontWeight: inputFontWeight,
    fontStyle: inputFontStyle,
    textDecorationLine: inputTextDecorationLine,
    textDecorationStyle: inputTextDecorationStyle,
    textDecorationColor: inputTextDecorationColor,
    letterSpacing: inputLetterSpacing,
    ...baseInputTextStyle
  } = flattenedInputTextStyle || {};

  const conditionalInputTextStyle = field?.value
    ? flattenedInputTextStyle
    : baseInputTextStyle;

  const flattenedPlaceholderStyle = StyleSheet.flatten(placeholderTextStyle);
  const resolvedPlaceholderColor =
    flattenedPlaceholderStyle?.color ||
    placeholderTextColor ||
    constants.defaultPlaceholderColor;

  const platformShadowStyle = getPlatformShadowStyle(flattenedStyle);

  const multilineWebStyles = getMultilineWebStyles(numberOfLines);
  const multilinePaddingStyle: ViewStyle | undefined = multiline
    ? { paddingTop: 10 }
    : undefined;
  const multilineHeightStyle: ViewStyle | undefined =
    multiline && !flattenedStyle.height
      ? { height: fixedHeight || 20 }
      : undefined;

  const inputValue = `${field?.value}`;
  const commonInputProps = {
    onFocus: handleOnFocus,
    onBlur: handleOnBlur,
    value: inputValue,
    onChangeText: handleOnChange,
    style: [
      styles.textInputStyle,
      !!flattenedStyle?.width && { width: flattenedStyle.width },
      conditionalInputTextStyle,
      multilinePaddingStyle,
    ] as any,
    placeholderTextColor: resolvedPlaceholderColor,
    textAlignVertical: 'center' as const,
    ellipsizeMode: multiline && numberOfLines ? ('tail' as const) : undefined,
  };

  return (
    <View
      testID={`view-${testId}`}
      style={[
        styles.wrapperStyle,
        containerStyle,
        getWrapperStyle(
          customFlex,
          customWidth,
          customAlignSelf,
          customMinWidth,
        ),
      ]}
      accessibilityLabel={accessibilityLabel}
      id={id}
    >
      <View
        style={[
          {
            height: multiline ? undefined : flattenedHeight,
          },
          platformShadowStyle,
          restFlattenedStyle,
          {
            borderColor: getBorderColor() || flattenedStyle?.borderColor,
          },
        ]}
      >
        <ASText
          testID={`label-${testId}`}
          numberOfLines={1}
          style={[
            styles.labelStyle,
            {
              backgroundColor: flattenedStyle?.backgroundColor,
              top: labelTopPosition,
              left: flattenedStyle?.paddingLeft,
            },
            labelTextStyle,
          ]}
        >
          {label}
        </ASText>
        <View style={contentContainerStyle}>
          {prefixIcon && (
            <View style={prefixIconStyles}>
              <IconView icon={prefixIcon} iconStyles={prefixIconStyles} />
            </View>
          )}
          {!!prefixText && (
            <ASText style={prefixTextStyle} testID={`prefixLabel-${testId}`}>
              {prefixText}
            </ASText>
          )}
          {showMask ? (
            <TextInputMask
              ref={
                inputRef as React.RefObject<
                  React.ElementRef<typeof TextInputMask>
                >
              }
              {...commonInputProps}
              style={[...commonInputProps.style, multilineWebStyles]}
              {...restProps}
              options={options}
              type={textFieldType}
              testID={`textInputMask-${testId}`}
            />
          ) : (
            <TextInput
              ref={inputRef}
              {...commonInputProps}
              style={[
                ...commonInputProps.style,
                multilineHeightStyle,
                multilineWebStyles,
              ]}
              autoCorrect={false}
              underlineColorAndroid='transparent'
              testID={`textInput-${testId}`}
              multiline={multiline}
              maxLength={restProps.maxLength}
              {...restProps}
            />
          )}
          {suffixIcon && (
            <View style={[styles.suffixIcon, suffixIconStyles]}>
              <IconView icon={suffixIcon} iconStyles={suffixIconStyles} />
            </View>
          )}
        </View>
      </View>
      {meta?.error && meta?.touched && (
        <ASText testID={`errorLabel-${testId}`} style={[errorMessageTextStyle]}>
          {getErrorMessage(meta?.error)}
        </ASText>
      )}
      {isOverlayEnabled && <ASOverlay />}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapperStyle: {
    position: 'relative',
  },
  labelStyle: {
    position: 'absolute',
  },
  inputContainerStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInputStyle: {
    flex: 1,
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  suffixIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ASTextField;
