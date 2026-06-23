import React, { ReactNode, useEffect, useState } from 'react';
import {
  ModalProps,
  NativeSyntheticEvent,
  TouchableOpacity,
  StyleProp,
  StyleSheet,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
  TextInput,
  ImageStyle,
  Platform,
} from 'react-native';
import { useField } from 'formik';
import ASText from '../ASText';

import ASOverlay from '../ASOverlay';

import ASCalendar from '../ASCalendar';
import ASPopUp from '../ASPopUp';
import ASColumn from '../ASColumn';

import { constants } from '../../utils/constants';
import { format } from 'date-fns';
import { getPlatformShadowStyle } from '../../utils/common.utils';
import glyphMap from '../../assets/fonts/materialIconsGlyphmap.json';

const resolveIconContent = (icon: string): string => {
  const codepoint =
    (glyphMap as Record<string, number>)[icon.replaceAll('_', '-')] ??
    (glyphMap as Record<string, number>)[icon];
  if (codepoint) return String.fromCodePoint(codepoint);
  return icon;
};

export type ASDatePickerProps = TextInputProps &
  ModalProps & {
    onClose?: () => void;
    dateFormat?: string;
  } & {
    name: string;
    prefixIcon?: ReactNode | string;
    suffixIcon?: ReactNode | string;
    formatError?: (error: string) => string;
    label?: string;
    formatNumber?: 'comma' | 'dot' | 'percentage';
    prefixText?: string;
    prefixTextStyle?: StyleProp<TextStyle>;
    labelTextStyle?: StyleProp<TextStyle>;
    inputTextStyle?: StyleProp<TextStyle>;
    errorMessageTextStyle?: StyleProp<TextStyle>;
    borderErrorColor?: string;
    borderActiveColor?: string;
    placeholderTextColor?: string;
    style?: StyleProp<ViewStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
    isOverlayEnabled?: boolean;
    id?: string;
    onChange?: (text: string) => void;
    isDefaultCurrentDate?: boolean;
    defaultDate?: string;
    range?: 'past' | 'future';
    maxDate?: string;
    minDate?: string;
    displayDateFormat?: string;
    selectedDateFormat?: string;
    selectedDayBackgroundColor?: string;
    selectedDayTextColor?: string;
    todayTextColor?: string;
    arrowColor?: string;
    dayTextColor?: string;
    calendarBackground?: string;
    textSectionTitleColor?: string;
    iconSize?: number;
    iconStyles?: StyleProp<ImageStyle>;
    calendarPopupStyles?: StyleProp<ViewStyle>;
  };

const getCalendarMinDate = (
  minDate: string | undefined,
  range: 'past' | 'future' | undefined,
  today: string,
): string | undefined => {
  if (minDate) return minDate;
  if (range === 'future') return today;
  return undefined;
};

const getCalendarMaxDate = (
  maxDate: string | undefined,
  range: 'past' | 'future' | undefined,
  today: string,
): string | undefined => {
  if (maxDate) return maxDate;
  if (range === 'past') return today;
  return undefined;
};

const getWrapperStyle = (
  customMarginBottom: number | undefined,
  customFlex: number | undefined,
  customWidth: number | string | undefined,
  customAlignSelf: string | undefined,
): ViewStyle => {
  const style: ViewStyle = { height: 'auto', borderColor: 'transparent' };
  if (customMarginBottom !== undefined) style.marginBottom = customMarginBottom;
  if (customFlex !== undefined) style.flex = customFlex;
  if (customWidth !== undefined) style.width = customWidth;
  if (customAlignSelf !== undefined) style.alignSelf = customAlignSelf;
  return style;
};

const getContainerBorderStyle = (
  flattenedStyle: ViewStyle | undefined,
): ViewStyle => {
  const style: ViewStyle = { marginBottom: 0 };
  if (flattenedStyle?.borderTopWidth !== undefined) {
    style.borderTopWidth = flattenedStyle.borderTopWidth;
  }
  if (flattenedStyle?.borderRightWidth !== undefined) {
    style.borderRightWidth = flattenedStyle.borderRightWidth;
  }
  if (flattenedStyle?.borderBottomWidth !== undefined) {
    style.borderBottomWidth = flattenedStyle.borderBottomWidth;
  }
  if (flattenedStyle?.borderLeftWidth !== undefined) {
    style.borderLeftWidth = flattenedStyle.borderLeftWidth;
  }
  if (flattenedStyle?.borderRadius !== undefined) {
    style.borderRadius = flattenedStyle.borderRadius;
  }
  return style;
};

const IconView: React.FC<{
  icon: ReactNode | string;
  iconStyles?: StyleProp<ImageStyle>;
}> = ({ icon, iconStyles }) => {
  const flattenedIconStyles: ImageStyle & {
    iconSize?: number;
    iconColor?: string;
  } = StyleSheet.flatten(iconStyles);
  return (
    <ASText
      style={{
        fontSize: flattenedIconStyles?.iconSize,

        fontFamily: Platform.select({
          ios: 'Material Icon',
          default: 'MaterialIcon',
        }),

        color: flattenedIconStyles?.iconColor,
      }}
    >
      {resolveIconContent(icon)}
    </ASText>
  );
};

const ASDatePicker = (props: ASDatePickerProps) => {
  const {
    name,
    onFocus,
    onBlur,
    suffixIcon,
    prefixIcon,
    prefixText,
    prefixTextStyle,
    formatError,
    label,
    formatNumber,
    labelTextStyle,
    inputTextStyle,
    borderErrorColor,
    borderActiveColor,
    style,
    containerStyle,
    errorMessageTextStyle,
    placeholderTextColor,
    accessibilityLabel,
    isOverlayEnabled,
    id,
    onChange,
    isDefaultCurrentDate,
    minDate,
    maxDate,
    range,
    displayDateFormat,
    selectedDateFormat,
    selectedDayBackgroundColor,
    selectedDayTextColor,
    todayTextColor,
    arrowColor,
    dayTextColor,
    calendarBackground,
    textSectionTitleColor,
    iconSize,
    iconStyles,
    defaultDate,
    calendarPopupStyles,
    ...restProps
  } = props;
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [field, meta] = useField(name);
  const [selectingDate] = useState<string>();

  const mergedStyle = StyleSheet.flatten([style, containerStyle]);
  const flattenedStyle = mergedStyle;
  const flattenedLabelStyle = StyleSheet.flatten(labelTextStyle) || {};
  const labelFontSize =
    flattenedLabelStyle.fontSize || styles.labelStyle?.fontSize;
  const labelTopPosition = -labelFontSize * 0.8;
  const flattenedHeight = flattenedStyle?.height || 44;

  const handleOnFocus = (
    event: NativeSyntheticEvent<TextInputFocusEventData>,
  ) => {
    if (onFocus) {
      onFocus(event);
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (isDefaultCurrentDate) {
      field.onChange(name)(format(today, selectedDateFormat));
    } else if (defaultDate) {
      field.onChange(name)(format(defaultDate, selectedDateFormat));
    }
  }, [isDefaultCurrentDate, defaultDate]);

  const getBorderColor = () => {
    if (meta.error && meta.touched) {
      return borderErrorColor;
    }
    return isVisible ? borderActiveColor : flattenedStyle?.borderColor;
  };

  const toggleVisibility = async () => {
    setIsVisible(!isVisible);
  };

  const renderDateFormat = field.value
    ? format(field.value, displayDateFormat)
    : '';

  const flattenedInputTextStyle = StyleSheet.flatten(inputTextStyle);
  const {
    fontWeight: inputFontWeight,
    fontStyle: inputFontStyle,
    textDecorationLine: inputTextDecorationLine,
    textDecorationStyle: inputTextDecorationStyle,
    textDecorationColor: inputTextDecorationColor,
    ...baseInputTextStyle
  } = flattenedInputTextStyle || {};

  const conditionalInputTextStyle = field?.value
    ? flattenedInputTextStyle
    : baseInputTextStyle;

  const {
    paddingTop: customPaddingTop,
    paddingBottom: customPaddingBottom,
    paddingVertical: customPaddingVertical,
    marginBottom: customMarginBottom,
    flex: customFlex,
    width: customWidth,
    alignSelf: customAlignSelf,
    ...restFlattenedStyle
  } = flattenedStyle || {};

  const platformShadowStyle = getPlatformShadowStyle(flattenedStyle);

  const calendarMinDate = getCalendarMinDate(minDate, range, today);
  const calendarMaxDate = getCalendarMaxDate(maxDate, range, today);

  const markedDates = selectingDate
    ? { [selectingDate]: { selected: true } }
    : undefined;

  const handleDayPress = (date: { dateString: string }) => {
    toggleVisibility();
    if (date) {
      field.onChange(name)(format(date.dateString, selectedDateFormat));
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleVisibility}
      style={[
        styles.wrapperStyle,
        getWrapperStyle(
          customMarginBottom,
          customFlex,
          customWidth,
          customAlignSelf,
        ),
      ]}
      accessibilityLabel={accessibilityLabel}
      id={id}
    >
      <View
        style={[
          styles.containerStyle,
          restFlattenedStyle,
          {
            borderColor: getBorderColor() || flattenedStyle?.borderColor,
            height: flattenedHeight,
          },
          getContainerBorderStyle(flattenedStyle),
          platformShadowStyle,
        ]}
      >
        <ASText
          numberOfLines={1}
          style={[
            styles.labelStyle,
            {
              backgroundColor: flattenedStyle?.backgroundColor || 'white',
              top: labelTopPosition,
              left: flattenedStyle?.paddingLeft,
            },
            labelTextStyle,
          ]}
        >
          {label}
        </ASText>
        <View style={styles.contentContainerStyle}>
          {prefixIcon && (
            <View style={styles.prefixIcon}>
              <IconView icon={prefixIcon} iconStyles={iconStyles} />
            </View>
          )}
          {!!prefixText && (
            <ASText style={[styles.prefixText, prefixTextStyle]}>
              {prefixText}
            </ASText>
          )}
          <View style={styles.inputContainerStyle}>
            <TextInput
              onFocus={handleOnFocus}
              value={field?.value ? renderDateFormat : undefined}
              style={[
                !!flattenedStyle?.width && { width: flattenedStyle.width },
                conditionalInputTextStyle,
              ]}
              placeholderTextColor={
                placeholderTextColor || constants.defaultPlaceholderColor
              }
              autoComplete={'off'}
              autoCorrect={false}
              editable={false}
              underlineColorAndroid='transparent'
              placeholder={displayDateFormat ?? 'yyyy-MM-dd'}
              {...restProps}
            />
          </View>
          {suffixIcon && (
            <View style={styles.suffixIcon}>
              <IconView icon={suffixIcon} iconStyles={iconStyles} />
            </View>
          )}
        </View>
      </View>
      {isOverlayEnabled && <ASOverlay />}
      <ASPopUp
        {...restProps}
        containerStyles={calendarPopupStyles}
        onClose={() => {}}
        visible={isVisible}
        isShowCloseIcon={false}
      >
        <ASColumn
          style={{
            paddingVertical: 40,
            paddingHorizontal: 14,
            justifyContent: 'center',
            borderRadius: 8,
            width: '90%',
            overflow: 'hidden',
          }}
        >
          <ASCalendar
            selectedDayBackgroundColor={selectedDayBackgroundColor}
            selectedDayTextColor={selectedDayTextColor}
            todayTextColor={todayTextColor}
            arrowColor={arrowColor}
            dayTextColor={dayTextColor ?? ''}
            calendarBackground={calendarBackground ?? ''}
            textSectionTitleColor={textSectionTitleColor ?? ''}
            minDate={calendarMinDate}
            maxDate={calendarMaxDate}
            markedDates={markedDates}
            onDayPress={handleDayPress}
          />
        </ASColumn>
      </ASPopUp>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapperStyle: {
    position: 'relative',
  },
  class_8pqr824r1: { color: 'white' },
  containerStyle: {
    borderRadius: 5,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: 2,
    paddingTop: 12,
    paddingBottom: 12,
    borderColor: 'transparent',
  },
  contentContainerStyle: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  labelStyle: {
    position: 'absolute',
  },
  inputContainerStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefixIcon: {
    marginRight: 8,
  },
  suffixIcon: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixText: {
    marginRight: 4,
  },
});

export default ASDatePicker;
