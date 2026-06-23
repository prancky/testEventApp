import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useField } from 'formik';
import { getPlatformShadowStyle } from '../../utils/common.utils';
import ASWrap from '../ASWrap';
import ASOverlay from '../ASOverlay';

export type ChipProps = {
  id?: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
  [key: string]: string | React.ReactNode;
};

export type ASChoiceChipsProps = {
  options?: ChipProps[];
  chips?: ChipProps[];
  name: string;
  isSingleChoice?: boolean;
  returnedKey?: string;
  contentLayout?:
    | 'center'
    | 'space-around'
    | 'space-between'
    | 'space-evenly'
    | 'flex-start'
    | 'flex-end';
  choiceChipTextStyles?: StyleProp<TextStyle>;
  selectedChipTextColor?: string;
  selectedChipBackgroundColor?: string;
  selectedChipBorderColor?: string;
  choiceChipStyles?: StyleProp<ViewStyle>;
  containerStyles?: StyleProp<ViewStyle>;
  isOverlayEnabled?: boolean;
  onChange?: (value: ChipProps[] | ChipProps[keyof ChipProps]) => void;
  id?: string;
  testId?: string;
  spacing?: number;
};

const ASChoiceChips: React.FC<ASChoiceChipsProps> = (
  props: ASChoiceChipsProps,
) => {
  const {
    options,
    chips,
    name,
    isSingleChoice,
    returnedKey,
    contentLayout,
    choiceChipTextStyles,
    choiceChipStyles,
    selectedChipBackgroundColor,
    selectedChipBorderColor,
    selectedChipTextColor,
    isOverlayEnabled,
    containerStyles,
    onChange,
    id,
    spacing,
    testId = 'ASChoiceChips',
  } = props;
  const resolvedOptions = chips || options || [];
  const [field, , helpers] = useField(name);
  const { setValue } = helpers || {};
  const selectedChoiceChips: ChipProps[] | string = field?.value;

  const flattenedContainerStyle = StyleSheet.flatten(choiceChipStyles);
  const flattenedBackgroundColor = flattenedContainerStyle?.backgroundColor;
  const flattenedBorderColor = flattenedContainerStyle?.borderColor;
  const flattenedTextColor = StyleSheet.flatten(choiceChipTextStyles);

  // Get platform-specific shadow style for chips
  const platformShadowStyle = getPlatformShadowStyle(flattenedContainerStyle);

  const onPressChoiceChip = (chip: ChipProps) => () => {
    if (Array.isArray(selectedChoiceChips)) {
      let _selectedChoiceChips: ChipProps[] = [...selectedChoiceChips];
      let _choiceChipIndex: number | boolean =
        _selectedChoiceChips &&
        Array.isArray(_selectedChoiceChips) &&
        _selectedChoiceChips?.findIndex(
          (c: ChipProps) => c?.value === chip?.value,
        );
      _choiceChipIndex = _choiceChipIndex === false ? -1 : _choiceChipIndex;

      if (_choiceChipIndex > -1) {
        _selectedChoiceChips = [
          ..._selectedChoiceChips.slice(0, _choiceChipIndex),
          ..._selectedChoiceChips.slice(_choiceChipIndex + 1),
        ];
      } else {
        _selectedChoiceChips.push(chip);
      }
      setValue(_selectedChoiceChips);
      onChange?.(_selectedChoiceChips);
    }
  };

  const onPressSingleChoiceChip = (chip: ChipProps) => () => {
    setValue(returnedKey ? chip?.[returnedKey] : chip?.value);
    onChange?.(returnedKey ? chip?.[returnedKey] : chip?.value);
  };

  const findSelected = (value: string) => {
    if (isSingleChoice) {
      return selectedChoiceChips === value;
    } else {
      return (
        Array.isArray(selectedChoiceChips) &&
        selectedChoiceChips?.find((item: ChipProps) => item?.value === value)
      );
    }
  };

  return (
    <ASWrap
      testId={testId}
      style={[
        styles.container,
        contentLayout ? { justifyContent: contentLayout } : null,
        containerStyles,
      ]}
      id={id}
    >
      {Array.isArray(resolvedOptions) &&
        resolvedOptions.map((chip, index) => (
          <TouchableOpacity
            key={chip.value}
            testId={testId}
            onPress={
              isSingleChoice
                ? onPressSingleChoiceChip(chip)
                : onPressChoiceChip(chip)
            }
            style={[
              choiceChipStyles,
              {
                backgroundColor: findSelected(chip?.value)
                  ? selectedChipBackgroundColor
                  : flattenedBackgroundColor,
                borderColor: findSelected(chip?.value)
                  ? selectedChipBorderColor
                  : flattenedBorderColor,
                marginRight: resolvedOptions.length - 1 === index ? 0 : spacing,
                marginBottom: spacing,
              },
              platformShadowStyle,
            ]}
          >
            {!!chip?.icon && (
              <View
                testID={`chipIcon-${testId}-${chip.value}`}
                style={styles.iconContainer}
              >
                {chip.icon}
              </View>
            )}
            <Text
              testID={`chipLabel-${testId}-${chip.value}`}
              style={[
                choiceChipTextStyles,
                {
                  color: findSelected(chip?.value)
                    ? selectedChipTextColor
                    : flattenedTextColor?.color,
                },
              ]}
            >
              {chip.label ?? chip.value}
            </Text>
          </TouchableOpacity>
        ))}
      {/* Render overlay on top to block interactions if overlay is enabled */}
      {isOverlayEnabled && <ASOverlay testId={`overlay-${testId}`} />}
    </ASWrap>
  );
};

const styles = StyleSheet.create({
  container: {},
  iconContainer: {
    marginRight: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent', // Fully transparent overlay
    zIndex: 1, // Ensures the overlay appears above the content
  },
});

export default ASChoiceChips;

//

// <ASChoiceChips options={[
//                     {value: 'car', label: 'Car'},
//                     {value: 'plane', label: 'Plane'},
//                     {value: 'bike', label: 'Bike'},
//                     {value: 'ship', label: 'Ship'},
//                     {value: 'heli', label: 'Helicopter'},
//                     {value: 'shuttle', label: 'Space shuttle'}
//                 ]}
//                name={'transport'}/>
