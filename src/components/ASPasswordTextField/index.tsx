import React, { FC, useState } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import ASTextField, { ASTextFieldProps } from '../ASTextField';
import { ShowPasswordIcon, HidePasswordIcon } from '../../assets/icon';

export type ASPasswordTextFieldProps = ASTextFieldProps & {
  suffixIconStyles: ViewStyle & { iconSize?: number; color?: string };
  accessibilityLabel?: string;
  isOverlayEnabled?: boolean;
  isShowSuffixIcon?: boolean;
  testId?: string;
};

const ASPasswordTextField: FC<ASPasswordTextFieldProps> = (
  props: ASPasswordTextFieldProps,
) => {
  const {
    suffixIconSize,
    testId = 'ASPasswordTextField',
    suffixIconStyles,
    accessibilityLabel,
    isOverlayEnabled,
    isShowSuffixIcon,
    inputTextStyle,
    ...restProps
  } = props;
  const [isSecureTextEntry, setIsSecureTextEntry] = useState<boolean>(true);

  const onPressSecureTextEntry = () => {
    setIsSecureTextEntry((prev: boolean) => !prev);
  };

  const suffixIconAccessibility = accessibilityLabel
    ? accessibilityLabel + '-icon'
    : '';

  return (
    <ASTextField
      testId={`textInput-${testId}`}
      suffixIcon={
        isShowSuffixIcon ? (
          <TouchableOpacity
            testID={`suffixIconButton-${testId}`}
            onPress={onPressSecureTextEntry}
            accessibilityLabel={suffixIconAccessibility}
          >
            {isSecureTextEntry ? (
              <ShowPasswordIcon
                size={suffixIconStyles.iconSize}
                color={suffixIconStyles.color}
              />
            ) : (
              <HidePasswordIcon
                size={suffixIconStyles.iconSize}
                color={suffixIconStyles.color}
              />
            )}
          </TouchableOpacity>
        ) : null
      }
      {...restProps}
      inputTextStyle={inputTextStyle}
      secureTextEntry={isSecureTextEntry}
      isOverlayEnabled={isOverlayEnabled}
    />
  );
};

export default ASPasswordTextField;
