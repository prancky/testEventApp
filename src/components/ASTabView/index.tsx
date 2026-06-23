import React, { ReactNode } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

export type ASTabViewProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  isScrollable?: boolean;
  scrollViewContentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: ScrollViewProps;
  title?: string;
  name?: string;
  testId?: string;
  icon?: string | React.ComponentType<object>;
  isDefaultTab?: boolean;
};

const ASTabView: React.FC<ASTabViewProps> = (props: ASTabViewProps) => {
  const {
    children,
    style,
    isScrollable = true,
    scrollViewContentContainerStyle,
    scrollViewProps,
    title,
    name,
    testId = 'ASTabView',
    ...restProps
  } = props;

  return (
    <View
      {...restProps}
      style={[styles.container, style]}
      testID={`view-${testId}`}
    >
      {isScrollable ? (
        <ScrollView
          testID={`scrollView-${testId}`}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          {...scrollViewProps}
          contentContainerStyle={[
            scrollViewContentContainerStyle,
            { paddingBottom: 50 },
          ]}
          nestedScrollEnabled={true}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ASTabView;
