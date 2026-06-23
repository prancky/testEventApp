import React, { ReactNode } from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

export type ASPageViewPageProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  isScrollable?: boolean;
  name?: string;
  icon?: string;
  isDefaultPageView?: boolean;
  title?: string;
  testId?: string;
};

/**
 * ASPageViewPage — a single page/slide inside ASPageView.
 *
 * The component is intentionally a thin wrapper: ASPageView owns all sizing
 * concerns (width, height, flex). ASPageViewPage simply fills the space it is
 * given and optionally makes its own content scrollable.
 *
 * Public API is unchanged.
 */
const ASPageViewPage: React.FC<ASPageViewPageProps> = (props) => {
  const {
    children,
    style,
    isScrollable,
    // consumed by ASPageView — not used for rendering
    name: _name,
    icon: _icon,
    isDefaultPageView: _isDefaultPageView,
    title: _title,
    testId = 'ASPageViewPage',
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
          style={styles.fill}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
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
  /**
   * fill the slide cell that ASPageView gives us.
   * Do NOT set an explicit width/height here — ASPageView controls that via
   * the wrapping slide <View>.
   */
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
  },
});

export default ASPageViewPage;
