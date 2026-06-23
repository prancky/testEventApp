import React, { ReactNode, useEffect, useRef, useState } from 'react';
import ASText from '../ASText';
import {
  FlatList,
  FlatListProps,
  NativeSyntheticEvent,
  Platform,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputFocusEventData,
  TextInputKeyPressEventData,
  TextStyle,
  View,
  ViewStyle,
  DimensionValue,
} from 'react-native';
import ASButton from '../ASButton';
import ASRow from '../ASRow';
import ASColumn from '../ASColumn';
import { DeleteIcon, ForwardIcon } from '../../assets/icon';

import { useField } from 'formik';
import ASOverlay from '../ASOverlay';
import CustomIcon from '../CustomIcon';

const KEYBOARDS = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  {
    label: '3',
    value: '3',
  },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  {
    label: '7',
    value: '7',
  },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: 'delete', value: 'delete' },
  {
    label: '0',
    value: '0',
  },
  { label: 'continue', value: 'continue' },
];

export type ASPinProps = KeyboardProps & {
  pinLength?: number;
  onPress: (item: string) => void;
  children?: ReactNode;
  onChange?: (item: string) => void;
  keyboardTypography?: TextStyle;
  inputTypography?: TextStyle;
  gap?: number;
  style?: ViewStyle;
  keyboardButtonRadius?: number;
  enableNativeKeyboard?: boolean;
  pinBoxRadius?: number;
  pinBoxSize?: number;
  pinBoxBorderColor?: string;
  pinBoxBackgroundColor?: string;
  keyboardButtonBorderColor?: string;
  keyboardButtonBackgroundColor?: string;
  isOverlayEnabled?: boolean;
  name: string;
  contentContainerStyle?: ViewStyle;
  columnWrapperStyle?: ViewStyle;
  testId?: string;
  keyboardButtonSize?: DimensionValue;
  pinBoxBorderWidth: number;
  pinBoxGap?: number;
};

export type KeyboardProps = {
  submitButtonIcon?: ReactNode;
  submitButtonStyle?: StyleProp<ViewStyle>;
  deleteButtonIcon?: ReactNode;
  deleteButtonStyle?: StyleProp<ViewStyle>;
  flatListProps?: FlatListProps<KeyboardItemProps>;
  onKeyboardPress?: (item: KeyboardItemProps) => void;
  typography?: TextStyle;
  keyboardButtonRadius?: number;
  keyboardButtonBorderColor?: string;
  keyboardButtonBackgroundColor?: string;
  keyboardStyle?: StyleProp<ViewStyle>;
  buttonIconColor?: string;
  contentContainerStyle?: ViewStyle;
  columnWrapperStyle?: ViewStyle;
  keyboardButtonSize?: DimensionValue;
  iconSize: number;
};

export type KeyboardItemProps = {
  label: string;
  value: string;
};

export type PinInputListProps = {
  pinLength: number;
  pin: string[];
  inputTypography?: TextStyle;
  onKeyboardPress: (item: KeyboardItemProps) => void;
  enableNativeKeyboard?: boolean;
  pinBoxRadius?: number;
  pinBoxSize?: number;
  pinBoxBorderColor?: string;
  pinBoxBackgroundColor?: string;
  onPress: (item: string) => void;
  pinBoxBorderWidth: number;
  pinBoxGap?: number;
};

const resetHorizontalScroll = () => {
  if (globalThis.window !== undefined) {
    const scrollX = globalThis.window.scrollX || globalThis.window.pageXOffset;
    if (scrollX !== 0) {
      globalThis.window.scrollTo(
        0,
        globalThis.window.scrollY || globalThis.window.pageYOffset,
      );
    }
  }
};

type ExtendedTextInput = TextInput & {
  focus?: (options?: { preventScroll?: boolean }) => void;
  scrollIntoView?: () => void;
  _node?: { scrollIntoView?: () => void };
};

function focusPrevInput(
  index: number,
  inputRefs: React.MutableRefObject<Array<ExtendedTextInput | null>>,
) {
  if (index <= 0) return;
  const prevInput = inputRefs.current[index - 1];
  if (!prevInput) return;
  if (Platform.OS === 'web') {
    prevInput?.focus?.({ preventScroll: true });
  } else {
    prevInput.focus();
  }
}

const Keyboard: React.FC<KeyboardProps> = (props: KeyboardProps) => {
  const {
    submitButtonIcon,
    submitButtonStyle,
    deleteButtonIcon,
    deleteButtonStyle,
    flatListProps,
    onKeyboardPress,
    typography,
    keyboardButtonRadius,
    keyboardButtonBorderColor,
    keyboardButtonBackgroundColor,
    keyboardStyle,
    buttonIconColor,
    contentContainerStyle,
    columnWrapperStyle,
    keyboardButtonSize,
    iconSize = 26,
  } = props;

  const handleKeyboardItemPress = (item: KeyboardItemProps) => () => {
    onKeyboardPress?.(item);
  };

  const renderIcon = (
    icon: React.ComponentProps<typeof CustomIcon>['icon'],
  ) => {
    return (
      <CustomIcon
        icon={icon}
        size={iconSize}
        color={buttonIconColor}
        crossOrigin='anonymous'
      />
    );
  };

  const renderKeyboardItem = ({ item }: { item: KeyboardItemProps }) => {
    const { backgroundColor, borderColor, borderRadius } =
      StyleSheet.flatten(keyboardStyle) || {};

    const renderDeleteIcon = () => {
      if (deleteButtonIcon) return renderIcon(deleteButtonIcon);
      return <DeleteIcon color={buttonIconColor} size={iconSize} />;
    };

    const renderContinueIcon = () => {
      if (submitButtonIcon) return renderIcon(submitButtonIcon);
      return <ForwardIcon color={buttonIconColor} size={iconSize} />;
    };

    return (
      <ASButton
        style={{
          ...styles.keyboardButton,
          ...StyleSheet.flatten(keyboardStyle),
          borderColor: borderColor || keyboardButtonBorderColor,
          ...(item?.value === 'continue' &&
            StyleSheet.flatten(submitButtonStyle)),
          backgroundColor: backgroundColor || keyboardButtonBackgroundColor,
          ...(item?.value === 'delete' &&
            StyleSheet.flatten(deleteButtonStyle)),
          ...(item?.value === 'continue' &&
            StyleSheet.flatten(submitButtonStyle)),
          borderRadius: borderRadius || keyboardButtonRadius,
          ...(keyboardButtonSize && {
            width: keyboardButtonSize,
            height: keyboardButtonSize,
          }),
        }}
        onPress={handleKeyboardItemPress(item)}
      >
        {item?.value !== 'delete' && item?.value !== 'continue' && (
          <ASText style={[{ fontWeight: 'bold', fontSize: 18 }, typography]}>
            {item?.label}
          </ASText>
        )}
        {item?.value === 'delete' && renderDeleteIcon()}
        {item?.value === 'continue' && renderContinueIcon()}
      </ASButton>
    );
  };

  return (
    <FlatList
      scrollEnabled={false}
      {...flatListProps}
      contentContainerStyle={[
        styles.flatListContainerStyles,
        StyleSheet.flatten(contentContainerStyle),
      ]}
      columnWrapperStyle={[
        styles.flatListColumnWrapperStyle,
        StyleSheet.flatten(columnWrapperStyle),
      ]}
      data={KEYBOARDS}
      renderItem={renderKeyboardItem}
      numColumns={3}
      keyExtractor={(item: KeyboardItemProps, index: number) =>
        `${item?.value}-${index}`
      }
    />
  );
};

const PinInputList: React.FC<PinInputListProps> = (
  props: PinInputListProps,
) => {
  const {
    pin,
    inputTypography,
    onKeyboardPress,
    enableNativeKeyboard,
    pinBoxRadius,
    pinBoxSize,
    pinBoxBackgroundColor,
    pinBoxBorderColor,
    onPress,
    pinBoxBorderWidth = 0,
    pinBoxGap,
  } = props;
  const PIN_SIZE = 50;
  const pinLength = props?.pinLength || 6;

  // References for each TextInput
  const inputRefs = useRef<ExtendedTextInput[]>([]);

  // Override scrollIntoView on web to prevent auto-scroll
  useEffect(() => {
    if (Platform.OS === 'web' && enableNativeKeyboard) {
      inputRefs.current.forEach((input) => {
        if (input) {
          const element = input;
          if (element.scrollIntoView) {
            element.scrollIntoView = () => {}; // Override to do nothing
          }
          if (element._node?.scrollIntoView) {
            element._node.scrollIntoView = () => {}; // Override to do nothing
          }
        }
      });
    }
  }, [enableNativeKeyboard, pin]);

  const handleInputChange = (text: string, index: number) => {
    if (text) {
      // Update the pin state
      onKeyboardPress({ label: text, value: text });

      // Focus the next input if available
      if (index < pinLength - 1) {
        const nextInput = inputRefs.current[index + 1];
        if (nextInput) {
          // On web, prevent scrollIntoView when focusing
          if (Platform.OS === 'web') {
            nextInput?.focus?.({ preventScroll: true });
          } else {
            nextInput.focus();
          }
        }
      }
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData> & {
      preventDefault?: () => void;
    },
    index: number,
  ) => {
    const key = e.nativeEvent.key;

    if (key === 'Backspace') {
      if (!pin[index] && index > 0) focusPrevInput(index, inputRefs);
      onKeyboardPress({ label: 'delete', value: 'delete' });
    }

    if (key === 'Enter' || key === 'Submit') {
      e.preventDefault();
      focusPrevInput(index, inputRefs);
      if (pin.length === pinLength) onPress?.(pin.join(''));
    }
  };

  const handleFocus = (
    e: NativeSyntheticEvent<TextInputFocusEventData> & {
      preventDefault?: () => void;
    },
    index: number,
  ) => {
    // Prevent auto-scroll on web
    if (Platform.OS === 'web') {
      // Prevent the default scroll-into-view behavior
      e?.preventDefault?.();

      // Keep resetting scroll position
      resetHorizontalScroll();
      requestAnimationFrame(resetHorizontalScroll);
      setTimeout(resetHorizontalScroll, 0);
      setTimeout(resetHorizontalScroll, 10);
    }
  };

  // Add effect to prevent scrolling on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Monitor for any scroll events
      globalThis.window.addEventListener('scroll', resetHorizontalScroll);

      return () => {
        globalThis.window.removeEventListener('scroll', resetHorizontalScroll);
      };
    }
  }, []);

  return (
    <ASRow
      style={{
        justifyContent: pinBoxGap ? 'flex-start' : 'space-between',
        ...(pinBoxGap !== undefined && { gap: pinBoxGap }),
      }}
    >
      {[...new Array(pinLength).keys()].map((pinIndex) => (
        <ASColumn
          key={`pin-${pinIndex}`}
          style={[
            styles.pinItemWrapper,
            {
              borderColor: pinBoxBorderColor,
              backgroundColor: pinBoxBackgroundColor,
              width: pinBoxSize || PIN_SIZE,
              height: pinBoxSize || PIN_SIZE,
              borderRadius: pinBoxRadius,
              borderWidth: pinBoxBorderWidth,
            },
          ]}
        >
          {enableNativeKeyboard ? (
            <TextInput
              ref={(el) => {
                inputRefs.current[pinIndex] = el!;
              }}
              style={[
                inputTypography,
                styles.textInputStyle,
                { width: pinBoxSize || PIN_SIZE },
              ]}
              value={pin[pinIndex] || ''}
              keyboardType='number-pad'
              onChangeText={(text) => handleInputChange(text, pinIndex)}
              onKeyPress={(e) => handleKeyPress(e, pinIndex)}
              onFocus={(e) => handleFocus(e, pinIndex)}
              maxLength={1}
              autoFocus={pinIndex === 0}
              caretHidden={true}
              showSoftInputOnFocus={true}
              focusable={false}
              selectTextOnFocus={false}
            />
          ) : (
            <ASText style={inputTypography}>{pin[pinIndex] || ''}</ASText>
          )}
        </ASColumn>
      ))}
    </ASRow>
  );
};

const ASPin: React.FC<ASPinProps> = (props: ASPinProps) => {
  const {
    submitButtonIcon,
    submitButtonStyle,
    deleteButtonIcon,
    deleteButtonStyle,
    flatListProps,
    pinLength = 6,
    onPress,
    children,
    onChange,
    keyboardTypography,
    inputTypography,
    typography,
    onKeyboardPress,
    gap,
    keyboardButtonRadius,
    enableNativeKeyboard,
    pinBoxRadius,
    pinBoxSize,
    keyboardButtonBackgroundColor,
    keyboardButtonBorderColor,
    pinBoxBackgroundColor,
    pinBoxBorderColor,
    isOverlayEnabled,
    keyboardStyle,
    name,
    style,
    buttonIconColor,
    contentContainerStyle,
    columnWrapperStyle,
    testId = 'ASPin',
    keyboardButtonSize,
    iconSize,
    pinBoxBorderWidth,
    pinBoxGap,
  } = props;
  const [pin, setPin] = useState<string[]>([]);
  const [, , helpers] = useField<string>(name);
  const { setValue } = helpers || {};

  useEffect(() => {
    onChange?.(pin.join(''));
  }, [pin]);

  useEffect(() => {
    setValue?.(pin.join(''));
  }, [pin]);

  const onKeyboardItemPress = (item: KeyboardItemProps) => {
    onKeyboardPress?.(item);
    if (item?.value === 'delete') {
      setPin((prevState: string[]) => {
        return prevState.slice(0, -1);
      });
    }

    if (item?.value === 'continue' && pin.length === pinLength) {
      const pinValue = pin.join('');
      onPress?.(pinValue);
      setValue?.(pinValue);
    }

    if (
      pin.length < pinLength &&
      item?.value !== 'delete' &&
      item?.value !== 'continue'
    ) {
      setPin((prevState: string[]) => {
        return [...prevState, item?.value];
      });
    }
  };

  return (
    <ASColumn
      style={[
        styles.flex1,
        !enableNativeKeyboard && { position: 'relative' },
        style,
      ]}
    >
      <View
        testID={`${testId}`}
        style={{
          ...(!enableNativeKeyboard && { marginBottom: gap || 24 }),
          width: '100%',
          ...(Platform.OS === 'web' && {
            position: 'relative',
            left: 0,
            transform: [{ translateX: 0 }],
          }),
        }}
      >
        <PinInputList
          pinLength={pinLength}
          pin={pin}
          inputTypography={inputTypography ?? typography}
          onKeyboardPress={onKeyboardItemPress}
          enableNativeKeyboard={enableNativeKeyboard}
          pinBoxRadius={pinBoxRadius}
          pinBoxSize={pinBoxSize}
          pinBoxBackgroundColor={pinBoxBackgroundColor}
          pinBoxBorderColor={pinBoxBorderColor}
          onPress={onPress}
          pinBoxBorderWidth={pinBoxBorderWidth}
          pinBoxGap={pinBoxGap}
        />
      </View>

      {children}

      {!enableNativeKeyboard && (
        <Keyboard
          keyboardStyle={keyboardStyle}
          submitButtonIcon={submitButtonIcon}
          submitButtonStyle={submitButtonStyle}
          deleteButtonIcon={deleteButtonIcon}
          deleteButtonStyle={deleteButtonStyle}
          flatListProps={flatListProps}
          contentContainerStyle={contentContainerStyle}
          columnWrapperStyle={columnWrapperStyle}
          onKeyboardPress={onKeyboardItemPress}
          typography={keyboardTypography ?? typography}
          keyboardButtonRadius={keyboardButtonRadius}
          keyboardButtonBackgroundColor={keyboardButtonBackgroundColor}
          keyboardButtonBorderColor={keyboardButtonBorderColor}
          buttonIconColor={buttonIconColor}
          keyboardButtonSize={keyboardButtonSize}
          iconSize={iconSize}
        />
      )}
      {isOverlayEnabled && <ASOverlay />}
    </ASColumn>
  );
};

export default ASPin;

const styles = StyleSheet.create({
  flex1: {
    width: '100%',
  },
  keyboardButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 5,
    width: 60,
    height: 60,
  },
  pinItemWrapper: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  textInputStyle: {
    textAlign: 'center',
    ...(Platform.OS === 'web' && {
      outline: 'none',
      userSelect: 'none',
    }),
  },
  flatListContainerStyles: { gap: 16, justifyContent: 'flex-end' },
  flatListColumnWrapperStyle: {
    paddingHorizontal: 40,
    justifyContent: 'space-between',
  },
});
