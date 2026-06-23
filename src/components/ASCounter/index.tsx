import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useField } from 'formik';
import { DecrementIcon, IncrementIcon } from '../../assets/icon';

// Define the type for component props
export type ASCounterProps = {
  initialValue?: number;
  minValue?: number;
  maxValue?: number;
  onValueChange?: (value: number) => void;
  incrementIconColor?: string;
  decrementIconColor?: string;
  incrementIconSize?: number;
  decrementIconSize?: number;
  labelTypography?: TextStyle;
  style?: ViewStyle;
  name: string;
  onChange?: (item: number) => void;
  stepValue?: number;
  testId?: string;
};

// ASCounter component with typed props
const ASCounter: React.FC<ASCounterProps> = ({
  initialValue,
  onValueChange,
  incrementIconColor,
  decrementIconColor,
  incrementIconSize,
  decrementIconSize,
  minValue,
  maxValue,
  style,
  name,
  labelTypography,
  onChange,
  stepValue,
  testId = 'ASCounter',
}) => {
  const [field, , helpers] = useField(name);
  const { setValue } = helpers || {};
  const count = field?.value || initialValue;

  const handleIncrement = () => {
    const newValue = count + stepValue;
    if (maxValue === undefined || newValue <= maxValue) {
      setValue(newValue);
      onValueChange?.(newValue);
      onChange?.(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = count - stepValue;
    if (newValue >= minValue) {
      setValue(newValue);
      onValueChange?.(newValue);
      onChange?.(newValue);
    }
  };

  return (
    <View testID={testId} style={[styles.container, style]}>
      <TouchableOpacity
        testID={`decreaseBtn-${testId}`}
        onPress={handleDecrement}
      >
        <DecrementIcon color={decrementIconColor} size={decrementIconSize} />
      </TouchableOpacity>
      <Text
        numberOfLines={1}
        testID={`count-${testId}`}
        style={[styles.countText, labelTypography]}
      >
        {count}
      </Text>
      <TouchableOpacity
        testID={`increaseBtn-${testId}`}
        onPress={handleIncrement}
      >
        <IncrementIcon color={incrementIconColor} size={incrementIconSize} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  countText: {
    flexWrap: 'wrap',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default ASCounter;
