import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useField, useFormikContext } from 'formik';
import Svg, { Path } from 'react-native-svg';
import { getPlatformShadowStyle } from '../../utils/common.utils';

type InnerIconStyle = ViewStyle & { strokeWidth?: number };

export type ASCheckBoxProps = {
  label?: string;
  labelStyles?: TextStyle;
  unFillColor?: string;
  fillColor: string;
  iconStyles?: ViewStyle;
  containerStyles?: ViewStyle;
  innerIconStyles?: ViewStyle;
  disabled?: boolean;
  accessibilityLabel?: string;
  size?: number;
  iconSize?: number;
  name: string;
  onChange?: (value: boolean) => void;
  inactiveBorderColor?: string;
  activeBorderColor?: string;
  testId?: string;
  defaultSelected?: boolean;
  tintColor?: string;
};

type ASCheckBoxBaseProps = ASCheckBoxProps & {
  toggleCheckBox: boolean;
  onValueChange: (value: boolean) => void;
};

const ASCheckBoxBase: React.FC<ASCheckBoxBaseProps> = (
  props: ASCheckBoxBaseProps,
) => {
  const {
    label,
    labelStyles,
    unFillColor,
    fillColor,
    iconStyles: flattenIconStyles,
    innerIconStyles: flattenInnerIconStyles,
    inactiveBorderColor,
    activeBorderColor,
    disabled,
    accessibilityLabel,
    size,
    iconSize,
    testId = 'ASCheckBox',
    tintColor,
    containerStyles,
    defaultSelected,
    name,
    onChange,
    toggleCheckBox,
    onValueChange,
    ...restProps
  } = props;
  const innerIconStyles = StyleSheet.flatten(flattenInnerIconStyles);
  const iconStyles = StyleSheet.flatten(flattenIconStyles);
  const iconBorderRadius: ViewStyle['borderRadius'] =
    innerIconStyles?.borderRadius || iconStyles?.borderRadius;
  const checkIconStrokeWidth: number | undefined = innerIconStyles?.strokeWidth;

  // Get platform-specific shadow style for icon (checkbox square)
  const platformShadowStyle = getPlatformShadowStyle(iconStyles);

  return (
    <BouncyCheckbox
      size={size}
      testID={testId}
      fillColor={fillColor || 'transparent'}
      unFillColor={unFillColor}
      text={label}
      style={containerStyles}
      iconStyle={[
        iconStyles,
        { borderRadius: iconBorderRadius, borderWidth: 0 },
        platformShadowStyle,
      ]}
      innerIconStyle={[
        innerIconStyles,
        {
          borderColor: toggleCheckBox
            ? (activeBorderColor ?? fillColor)
            : inactiveBorderColor,
          borderRadius: iconBorderRadius,
        },
      ]}
      textContainerStyle={{
        flex: 1,
        marginLeft: 0,
        overflow: 'hidden',
        ...(!label && { display: 'none' }),
      }}
      textStyle={[
        {
          flexShrink: 1,
          ...(Platform.OS === 'web' && {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }),
        },
        labelStyles,
      ]}
      textProps={{ numberOfLines: 1, ellipsizeMode: 'tail' }}
      onPress={(isChecked: boolean) => {
        onValueChange(isChecked);
      }}
      isChecked={toggleCheckBox}
      iconImageStyle={{
        width: iconSize,
        height: iconSize,
        tintColor: tintColor,
      }}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      iconComponent={
        toggleCheckBox ? (
          <Svg
            width={iconSize}
            height={iconSize}
            viewBox='0 0 20 20'
            fill='none'
          >
            <Path
              d='M4 10L8 14L16 6'
              stroke={tintColor}
              strokeWidth={checkIconStrokeWidth}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </Svg>
        ) : undefined
      }
      {...restProps}
    />
  );
};

const ASCheckBoxFormik: React.FC<ASCheckBoxProps> = (
  props: ASCheckBoxProps,
) => {
  const { defaultSelected, name, onChange, ...restProps } = props;

  const [field, , helpers] = useField<boolean>(name);
  const [toggleCheckBox, setToggleCheckBox] =
    useState<boolean>(defaultSelected);

  useEffect(() => {
    setToggleCheckBox(field.value);
  }, [field.value]);

  const onValueChange = (newValue: boolean) => {
    setToggleCheckBox(newValue);
    helpers.setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <ASCheckBoxBase
      {...restProps}
      defaultSelected={defaultSelected}
      name={name}
      onChange={onChange}
      toggleCheckBox={toggleCheckBox}
      onValueChange={onValueChange}
    />
  );
};

const ASCheckBox: React.FC<ASCheckBoxProps> = (props: ASCheckBoxProps) => {
  const { defaultSelected, onChange, name, ...restProps } = props;

  const formikContext = useFormikContext();
  const [toggleCheckBox, setToggleCheckBox] =
    useState<boolean>(defaultSelected);

  const onValueChange = (newValue: boolean) => {
    setToggleCheckBox(newValue);
    onChange?.(newValue);
  };

  if (formikContext && name) {
    return <ASCheckBoxFormik {...props} />;
  }

  return (
    <ASCheckBoxBase
      {...restProps}
      defaultSelected={defaultSelected}
      name={name}
      onChange={onChange}
      toggleCheckBox={toggleCheckBox}
      onValueChange={onValueChange}
    />
  );
};

export default ASCheckBox;
