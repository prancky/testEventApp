import React from 'react';
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  StyleSheet,
} from 'react-native';
import {
  getLoadingStatus,
  useIsTimeoutLoading,
} from '../../utils/common.utils';

export type ASLoadingIndicatorProps = ActivityIndicatorProps & {
  loading?: boolean | boolean[];
  timeout?: number;
  testId?: string;
};

const ASLoadingIndicator: React.FC<ASLoadingIndicatorProps> = (
  props: ASLoadingIndicatorProps,
) => {
  const {
    loading,
    size,
    timeout,
    testId = 'ASLoadingIndicator',
    ...restProps
  } = props;
  const isLoading = getLoadingStatus(loading); // Handle multiple loading. If any of the workflow loading is true => Show loading
  const isTimeout = useIsTimeoutLoading(timeout, isLoading); // If timeout stop loading to prevent indefinite loading

  if (isTimeout || !isLoading) return null;

  return (
    <ActivityIndicator
      animating={isLoading}
      size={size}
      testID={testId}
      hidesWhenStopped
      style={styles.loadingIndicator}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  loadingIndicator: {},
});

export default ASLoadingIndicator;
