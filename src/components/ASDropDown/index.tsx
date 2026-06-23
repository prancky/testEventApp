import React, { useState, useRef } from 'react';
import {
  ColorValue,
  FlatList,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import { DropdownProps } from 'react-native-element-dropdown/src/components/Dropdown/model';
import ASText from '../ASText';
import {
  hexToRgbaWithOpacity,
  isAndroid,
  getPlatformShadowStyle,
} from '../../utils/common.utils';
import { FieldHookConfig, useField } from 'formik';
import { useThemeColors, useThemeComponent } from '../../context/ThemeContext';
import ASOverlay from '../ASOverlay';
import ASButton from '../ASButton';
import Svg, { Path } from 'react-native-svg';

export type DropDownOptionsProps = {
  [key: string]: string | number | boolean | null | undefined;
};

const CloseIcon = (props: { size?: number | string; color?: ColorValue }) => (
  <Svg
    width={props.size ?? 30}
    height={props.size ?? 30}
    viewBox='0 0 24 24'
    fill='none'
  >
    <Path
      id='Vector'
      d='M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18'
      stroke={props.color ?? '#000000'}
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Svg>
);

const DownIcon = (props: {
  width?: number | string;
  height?: number | string;
  color?: ColorValue;
}) => {
  const { width, height, color } = props;
  return (
    <Svg width={width} height={height} viewBox='0 0 16 16' fill={'none'}>
      <Path
        d='M7.99944 8.78089L11.2993 5.48108L12.2421 6.42389L7.99944 10.6666L3.75684 6.42389L4.69964 5.48108L7.99944 8.78089Z'
        fill={color}
      />
    </Svg>
  );
};

export type ASDropDownProps = Omit<
  DropdownProps<DropDownOptionsProps>,
  'labelField' | 'valueField' | 'onChange' | 'data'
> & {
  options: DropDownOptionsProps[] | undefined;
  name: string | FieldHookConfig<string | string[]>;
  labelField: string;
  valueField: string;
  onSelect?: (item: DropDownOptionsProps | string[]) => void;
  renderLeftIcon?: () => React.ReactNode;
  onChangeItem?: (item: DropDownOptionsProps) => void;
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  iconStyles?: StyleProp<ImageStyle>;
  placeholderTextStyles?: StyleProp<TextStyle>;
  dropdownTextStyles?: StyleProp<TextStyle>;
  labelTextStyle?: StyleProp<TextStyle>;
  isOverlayEnabled?: boolean;
  onChange?: (
    item: string | number | boolean | null | undefined | string[],
  ) => void;
  id?: string;
  search?: boolean;
  isMultiChoices?: boolean;
  testId?: string;
  activeColor?: string;
  borderActiveColor?: string;
  borderErrorColor?: string;
};

const ASDropDown: React.FC<ASDropDownProps> = (props: ASDropDownProps) => {
  const colors = useThemeColors();
  const themeComponents = useThemeComponent();
  const {
    options,
    renderLeftIcon,
    placeholder,
    onSelect,
    searchPlaceholder,
    search,
    label,
    name,
    containerStyle,
    iconStyles,
    selectedTextStyle,
    labelField = 'label',
    valueField = 'value',
    placeholderTextStyles,
    dropdownTextStyles,
    labelTextStyle,
    isOverlayEnabled,
    id,
    onChange,
    isMultiChoices = false,
    iconColor,
    testId = 'ASDropdown',
    activeColor,
    borderActiveColor,
    borderErrorColor,
    ...restProps
  } = props;
  const [field, meta, helpers] = useField<string | string[]>(name);
  const { setValue } = helpers || {};
  const [isFocus, setIsFocus] = useState(false);
  const [searchValue, setSearchValue] = useState<string>();
  const dropdownRef = useRef<React.ElementRef<typeof Dropdown>>(null);
  const multiSelectRef = useRef<React.ElementRef<typeof MultiSelect>>(null);

  const flattenedLabelStyle = StyleSheet.flatten(labelTextStyle) || {};
  const labelFontSize =
    flattenedLabelStyle?.fontSize || styles.labelStyle.fontSize;
  const labelTopPosition = -labelFontSize * 0.8;
  const flatttenedContainerStyle = StyleSheet.flatten(containerStyle) || {};

  const renderSingleChoiceItem = (item: DropDownOptionsProps) => {
    const isSelected = field?.value === item?.value;
    const renderLabel = item[labelField] || item[valueField] || '';

    return (
      <View
        style={[
          styles.item,
          {
            ...(isSelected
              ? { backgroundColor: hexToRgbaWithOpacity(activeColor) }
              : {}),
          },
        ]}
      >
        <Text
          style={[
            styles.textItem,
            {
              color: themeComponents.dropdown.selectedText.color,
            },
            dropdownTextStyles,
          ]}
          testID={`dropdown-text-${testId}`}
        >
          {renderLabel}
        </Text>
      </View>
    );
  };

  const renderMultipleChoiceItem = (item: DropDownOptionsProps) => {
    const isSelected =
      Array.isArray(field?.value) && field?.value?.includes(item?.value);
    const renderLabel = item[labelField] ?? item[valueField] ?? '';
    return (
      <View
        style={[
          styles.item,
          {
            ...(isSelected
              ? { backgroundColor: hexToRgbaWithOpacity(activeColor) }
              : {}),
          },
        ]}
      >
        <Text
          style={[
            styles.textItem,
            {
              color: themeComponents.dropdown.selectedText.color,
            },
            dropdownTextStyles,
          ]}
          testID={`dropdown-text-${testId}`}
        >
          {renderLabel}
        </Text>
      </View>
    );
  };

  const renderSelectedItem = (
    item: DropDownOptionsProps,
    unSelect?: (_item: DropDownOptionsProps) => void,
  ) => {
    return (
      <ASButton
        style={[styles.multipleSelectionButton]}
        onPress={() => unSelect?.(item)}
      >
        <ASText style={{}}>{item.label}</ASText>
      </ASButton>
    );
  };

  const onChangeDropDownField = (item: DropDownOptionsProps) => {
    setValue?.(item?.[valueField]);
    onSelect?.(item); // Trigger the onSelect callback if provided
    onChange?.(item?.[valueField]); // Trigger onChange event if provided
    setSearchValue(''); // Clear search value after selection
  };

  const onChangeMultipleDropDownField = (item: string[]) => {
    setValue?.(item);
    onSelect?.(item); // Trigger the onSelect callback if provided
    onChange?.(item); // Trigger onChange event if provided
  };

  const filterEmptyData = options
    ? options.filter((t) => t[labelField] || t[valueField])
    : [];

  const getFilteredData = () => {
    if (!filterEmptyData) return [];
    if (!searchValue) return filterEmptyData;
    return filterEmptyData.filter((item) => {
      const label = item[labelField] || item[valueField] || '';
      return label.toLowerCase().includes(searchValue?.toLowerCase());
    });
  };
  const filteredData = getFilteredData();

  // Get platform-specific shadow style from flattened style
  const platformShadowStyle = getPlatformShadowStyle(flatttenedContainerStyle);

  // Separate wrapper styles (alignment/layout) from dropdown styles (appearance)
  const wrapperStyle: ViewStyle = {};
  const dropdownOnlyStyle: ViewStyle = {};

  // Extract layout/alignment styles for wrapper
  const layoutKeys = new Set([
    'width',
    'minWidth',
    'maxWidth',
    'height',
    'minHeight',
    'maxHeight',
    'alignSelf',
    'flex',
    'flexGrow',
    'flexShrink',
    'flexBasis',
    'margin',
    'marginTop',
    'marginBottom',
    'marginLeft',
    'marginRight',
    'marginHorizontal',
    'marginVertical',
    'marginStart',
    'marginEnd',
  ]);

  // Keys that conflict with the Dropdown library's internal flex layout
  // and must not be forwarded to its style prop
  const dropdownExcludedKeys = new Set([
    'alignItems',
    'justifyContent',
    'flexDirection',
    'display',
  ]);

  Object.keys(flatttenedContainerStyle || {}).forEach((key) => {
    if (layoutKeys.has(key)) {
      wrapperStyle[key as keyof ViewStyle] = flatttenedContainerStyle[key];
    } else if (!dropdownExcludedKeys.has(key)) {
      dropdownOnlyStyle[key] = flatttenedContainerStyle[key];
    }
  });

  // Calculate dropdown container styles (without layout/alignment)
  const dropdownContainerStyle = [
    styles.container,
    {
      backgroundColor: dropdownOnlyStyle?.backgroundColor || 'transparent',
      minHeight: wrapperStyle.minHeight,
      maxHeight: wrapperStyle.maxHeight,
      height: wrapperStyle.height,
    },
    dropdownOnlyStyle,
    {
      borderColor: (() => {
        if (meta?.error && meta?.touched) return borderErrorColor;
        if (isFocus) return borderActiveColor || activeColor;
        return dropdownOnlyStyle?.borderColor || 'transparent';
      })(),
    },
    {
      paddingTop:
        typeof dropdownOnlyStyle?.paddingTop === 'number' &&
        dropdownOnlyStyle.paddingTop > 0
          ? dropdownOnlyStyle.paddingTop - 1
          : 0,
      paddingBottom:
        typeof dropdownOnlyStyle?.paddingBottom === 'number' &&
        dropdownOnlyStyle.paddingBottom > 0
          ? dropdownOnlyStyle.paddingBottom - 1
          : 0,
      paddingLeft: flatttenedContainerStyle?.paddingLeft,
      paddingRight: flatttenedContainerStyle?.paddingRight,
    },
    platformShadowStyle,
  ];

  // Calculate label top position (marginTop is now on wrapper, so no adjustment needed)
  const adjustedLabelTop = labelTopPosition;

  const labelElement = !!label && (
    <ASText
      style={[
        styles.labelStyle,
        {
          color: colors?.onTertiary || '#999999',
          top: adjustedLabelTop,
          backgroundColor: dropdownOnlyStyle?.backgroundColor,
          left: dropdownOnlyStyle?.paddingLeft,
          zIndex: 1,
        },
        labelTextStyle,
      ]}
      testID={`label-${testId}`}
      pointerEvents='none'
      numberOfLines={1}
    >
      {label}
    </ASText>
  );

  // Extract icon properties from iconStyles
  const flattenedIconStyles: ImageStyle & {
    iconColor?: ColorValue;
    iconSize?: number;
  } = StyleSheet.flatten(iconStyles) || {};
  const iconColorFromStyles =
    flattenedIconStyles.iconColor || iconColor || '#000000';

  // Normalize data to ensure label field has value field as fallback
  const normalizedData = (filteredData || []).map((item) => ({
    ...item,
    [labelField]: item[labelField] || item[valueField] || '',
  }));

  const isSingleChoice = !isMultiChoices;
  const dropdownContent = isSingleChoice ? (
    <TouchableWithoutFeedback onPress={() => dropdownRef.current?.open?.()}>
      <View style={[{ position: 'relative' }, wrapperStyle]}>
        {labelElement}
        <Dropdown
          ref={dropdownRef}
          testID={`dropdown-${testId}`}
          style={dropdownContainerStyle}
          placeholderStyle={[styles.placeholderStyle, placeholderTextStyles]}
          iconStyle={[styles.iconStyle, iconStyles]}
          search={search}
          maxHeight={300}
          value={field?.value}
          searchPlaceholder={searchPlaceholder}
          renderLeftIcon={renderLeftIcon}
          renderItem={renderSingleChoiceItem}
          placeholder={placeholder}
          onFocus={() => setIsFocus(true)}
          onBlur={() => {
            setIsFocus(false);
            setSearchValue(''); // Clear search when dropdown closes
          }}
          dropdownPosition='bottom'
          renderRightIcon={() => (
            <DownIcon
              width={flattenedIconStyles?.iconSize}
              height={flattenedIconStyles?.iconSize}
              color={iconColorFromStyles}
            />
          )}
          {...restProps}
          selectedTextStyle={[
            styles.selectedTextStyle,
            {
              color: themeComponents.dropdown.selectedText.color,
            },
            selectedTextStyle,
          ]}
          selectedTextProps={{ numberOfLines: 1, ellipsizeMode: 'tail' }}
          data={normalizedData}
          onChange={onChangeDropDownField}
          renderList={(props) => (
            <FlatList
              data={props.data}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => {
                      props.onSelect(item);
                    }}
                  >
                    <Text style={styles.textItem}>
                      {item.label ?? item.value}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              keyboardShouldPersistTaps='handled'
            />
          )}
          renderInputSearch={() => (
            <View style={styles.searchBox}>
              <TextInput
                placeholder='Search...'
                value={searchValue}
                onChangeText={setSearchValue}
                style={styles.textInput}
              />
              {searchValue ? (
                <TouchableOpacity onPress={() => setSearchValue('')}>
                  <CloseIcon size={18} color='#999' />
                </TouchableOpacity>
              ) : null}
            </View>
          )}
          labelField={labelField}
          valueField={valueField}
          mode='auto'
        />
      </View>
    </TouchableWithoutFeedback>
  ) : (
    <TouchableWithoutFeedback onPress={() => multiSelectRef.current?.open?.()}>
      <View style={[{ position: 'relative' }, wrapperStyle]}>
        {labelElement}
        <MultiSelect
          ref={multiSelectRef}
          testID={`dropdownMultipleSelect-${testId}`}
          style={dropdownContainerStyle}
          placeholderStyle={[styles.placeholderStyle, placeholderTextStyles]}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={[styles.iconStyle, iconStyles]}
          search={search}
          maxHeight={300}
          value={field?.value || []}
          searchPlaceholder={searchPlaceholder}
          renderLeftIcon={renderLeftIcon}
          renderItem={renderMultipleChoiceItem}
          renderSelectedItem={renderSelectedItem}
          placeholder={placeholder}
          onFocus={() => setIsFocus(true)}
          onBlur={() => {
            setIsFocus(false);
            setSearchValue(''); // Clear search when dropdown closes
          }}
          renderRightIcon={() => (
            <DownIcon
              width={flattenedIconStyles?.iconSize}
              height={flattenedIconStyles?.iconSize}
              color={iconColorFromStyles}
            />
          )}
          {...restProps}
          selectedTextStyle={[
            styles.selectedTextStyle,
            {
              color: themeComponents.dropdown.selectedText.color,
            },
            selectedTextStyle,
          ]}
          data={(options || []).map((item) => ({
            ...item,
            [labelField]: item[labelField] || item[valueField] || '',
          }))}
          onChange={onChangeMultipleDropDownField}
          labelField={labelField}
          valueField={valueField}
        />
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <>
      {dropdownContent}
      {isOverlayEnabled && <ASOverlay testId={`dropdownOverlay-${testId}`} />}
    </>
  );
};

export default ASDropDown;

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
    borderColor: 'transparent',
  },
  dropdown: {},
  item: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 12,
  },
  placeholderStyle: {
    fontSize: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    margin: 8,
  },
  textInput: {
    flex: 1,
    height: 40,
    width: '100%',
  },
  selectedTextStyle: {
    flex: 1,
    fontSize: isAndroid ? 10 : 12,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  iconStyle: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  inputSearchStyle: {
    height: 40,
    flexDirection: 'row',
  },
  labelStyle: {
    position: 'absolute',
  },
  multipleSelectionButton: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 4,
  },
});
