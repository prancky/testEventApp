import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import ASText from '../ASText';

export type ASExpandableTextProps = {
  initialLines: number;
  text: string;
  textStyle?: StyleProp<TextStyle>;
  readMoreTextStyles?: StyleProp<TextStyle>;
  testId?: string;
};

const ASExpandableText: React.FC<ASExpandableTextProps> = (
  props: ASExpandableTextProps,
) => {
  const {
    initialLines = 1,
    text,
    textStyle,
    readMoreTextStyles,
    testId = 'ASExpandableText',
  } = props;
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View testID={`view-${testId}`}>
      <ASText
        testID={`text-${testId}`}
        numberOfLines={isExpanded ? undefined : initialLines}
        style={textStyle}
      >
        {text}
      </ASText>

      {text?.length > initialLines && (
        <TouchableOpacity
          onPress={toggleExpansion}
          testID={`readMoreButton-${testId}`}
        >
          <ASText testID={`readMoreText-${testId}`} style={readMoreTextStyles}>
            {isExpanded ? 'Read less' : 'Read more'}
          </ASText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({});

export default ASExpandableText;

// NOTE:  ASExpandableText Example
/*
         <ASExpandableText initialLines={1}
                           text={'Lorem ispum Lorem ispum Lorem ispum Lorem ispum Lorem ispum Lorem ispum Lorem ispum Lorem ispum Lorem ispum Lorem ispum '}/>

* */
