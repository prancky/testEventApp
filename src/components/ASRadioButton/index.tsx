import React from 'react';
import {
  ColorValue,
  Platform,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { FieldHookConfig, useField } from 'formik';
import { TickIcon } from '../../assets/icon';

import { getPlatformShadowStyle } from '../../utils/common.utils';
import ASColumn from '../ASColumn';
import ASText from '../ASText';
import ASRow from '../ASRow';
import ASOverlay from '../ASOverlay';

export type ASRadioButtonItemProps = {
  label: string;
  value: string;
};

export type ASRadioButtonProps = {
  options: ASRadioButtonItemProps[];
  name: string | FieldHookConfig<string>;
  circleStyle?: StyleProp<ViewStyle>;
  radioButtonStyle?: StyleProp<ViewStyle>;
  innerCircleStyle?: StyleProp<ViewStyle>;
  color?: ColorValue;
  labelStyle?: StyleProp<TextStyle>;
  radioType?: 'default' | 'tick';
  isOverlayEnabled?: boolean;
  onChange?: (item: string) => void;
  inActiveColor?: ColorValue;
  activeColor?: ColorValue;
  style?: ViewStyle;
  spacing?: number;
  testId?: string;
  axis?: 'vertical' | 'horizontal';
  buttonPosition?: 'left' | 'right';
  tickContainerStyle?: ViewStyle;
};

const ASRadioButton: React.FC<ASRadioButtonProps> = (
  props: ASRadioButtonProps,
) => {
  const {
    options = [],
    name,
    radioButtonStyle,
    circleStyle,
    innerCircleStyle,
    color,
    labelStyle,
    radioType,
    isOverlayEnabled,
    onChange,
    inActiveColor,
    activeColor,
    style: flattenStyle,
    spacing,
    axis,
    buttonPosition,
    tickContainerStyle,
    testId = 'ASRadioButton',
  } = props;
  const [field, , helpers] = useField(name);
  const { setValue } = helpers || {};
  const style = StyleSheet.flatten(flattenStyle);

  // Get platform-specific shadow style for radio button style
  const flattenedRadioButtonStyle = StyleSheet.flatten(circleStyle);
  const platformShadowStyle = getPlatformShadowStyle(flattenedRadioButtonStyle);

  const onPressRadioButton = (item: ASRadioButtonItemProps) => () => {
    setValue?.(item?.value);
    onChange?.(item?.value);
  };

  const renderButton = (item: ASRadioButtonItemProps) => (
    <View
      testID={`radioButton-${testId}-${item.value}`}
      style={[
        styles.radioButton,
        {
          borderColor:
            item?.value === field?.value ? activeColor : inActiveColor,
          marginRight: buttonPosition === 'left' ? spacing : 0,
          marginLeft: buttonPosition === 'right' ? spacing : 0,
        },
        platformShadowStyle,
      ]}
    >
      {item?.value === field?.value && (
        <View
          testID={`innerCircle-${testId}-${item.value}`}
          style={[
            styles.innerCircle,
            innerCircleStyle,
            { backgroundColor: activeColor },
          ]}
        />
      )}
    </View>
  );

  const defaultRadioButtonType = (item: ASRadioButtonItemProps) => {
    return (
      <>
        {buttonPosition === 'left' && renderButton(item)}
        <ASText
          testId={`label-${testId}-${item.value}`}
          style={[
            styles.label,
            {
              flex: 1,
              ...(Platform.OS === 'web' && {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }),
            },
            labelStyle,
          ]}
          numberOfLines={1}
        >
          {item?.label ?? item?.value}
        </ASText>
        {buttonPosition === 'right' && renderButton(item)}
      </>
    );
  };

  const tickRadioButtonType = (item: ASRadioButtonItemProps) => {
    return (
      <ASRow
        testId={`tickRadioRow-${testId}-${item.value}`}
        style={tickContainerStyle}
      >
        <ASText
          testId={`tickLabel-${testId}-${item.value}`}
          style={[
            styles.ticklabel,
            {
              flex: 1,
              ...(Platform.OS === 'web' && {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }),
            },
            labelStyle,
          ]}
          numberOfLines={1}
        >
          {item?.label ?? item?.value}
        </ASText>
        <TickIcon
          size={24}
          color={item?.value === field?.value ? color : 'transparent'}
        />
      </ASRow>
    );
  };

  const renderRadioButtonType = (item: ASRadioButtonItemProps) => {
    switch (radioType) {
      case 'default':
        return defaultRadioButtonType(item);
      case 'tick':
        return tickRadioButtonType(item);
      default:
        return defaultRadioButtonType(item);
    }
  };

  const mapRadioButton = (item: ASRadioButtonItemProps, index: number) => {
    return (
      <TouchableOpacity
        key={item?.value || item?.label}
        onPress={onPressRadioButton(item)}
        testID={testId}
        style={[
          styles.container,
          {
            alignSelf: 'stretch',
            overflow: 'hidden',
          },
          axis === 'vertical'
            ? {
                marginBottom: spacing,
              }
            : {
                marginRight: spacing,
              },
          radioButtonStyle,
        ]}
      >
        {renderRadioButtonType(item)}
      </TouchableOpacity>
    );
  };

  return (
    <ASColumn
      testId={`container-${testId}`}
      style={[
        style,
        axis === 'vertical'
          ? {
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }
          : {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
            },
      ]}
    >
      {options
        ?.filter((item) => item?.label && item?.value)
        .map((item, index) => mapRadioButton(item, index))}
      {isOverlayEnabled && <ASOverlay testId={`overlay-${testId}`} />}
    </ASColumn>
  );
};

export default ASRadioButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {},
  ticklabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  tickRadioBtn: {
    justifyContent: 'space-between',
    flex: 1,
    padding: 18,
    borderRadius: 5,
    alignItems: 'center',
  },
});

/*
         <ASRadioButton name={'gender'}
                        options={[{label: 'Male', value: 'male'}, {label: 'Female', value: 'female'}]}/>
* */
