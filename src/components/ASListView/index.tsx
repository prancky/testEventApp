import React, { useCallback, useMemo } from 'react';
import {
  FlatListProps,
  ListRenderItem,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import LoadingIndicator from '../ASLoadingIndicator';

type ListItem = Record<string, unknown>;

const toListItemKey = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return `${value}`; // NOSONAR (S6551) — value is narrowed to number|boolean|bigint
  }
  return JSON.stringify(value);
};

const SpacerView: React.FC<{ isHorizontal: boolean; spacing: number }> = ({
  isHorizontal,
  spacing,
}) => <View style={isHorizontal ? { width: spacing } : { height: spacing }} />;

export type ASListViewProps = FlatListProps<ListItem> & {
  data: ListItem[];
  renderItem: ListRenderItem<ListItem>;
  loading?: boolean | boolean[];
  accessibilityLabel?: string;
  testId?: string;
  orientation?: 'horizontal' | 'vertical';
  startSpacing?: number;
  itemSpacing?: number;
  endSpacing?: number;
  style?: StyleProp<ViewStyle>;
};

const ASListView: React.FC<ASListViewProps> = (props: ASListViewProps) => {
  const {
    data,
    renderItem,
    loading,
    testId = 'ASListView',
    orientation = 'vertical',
    startSpacing,
    itemSpacing,
    endSpacing,
    style,
    ...restProps
  } = props;

  const flattenedStyle: ViewStyle & Record<string, unknown> =
    StyleSheet.flatten(style) || {};
  const { alignItems, justifyContent, alignContent, ...listStyle } =
    flattenedStyle;
  const contentLayoutStyle = {
    ...(alignItems !== undefined && { alignItems }),
    ...(justifyContent !== undefined && { justifyContent }),
    ...(alignContent !== undefined && { alignContent }),
  };

  const keyExtractor = useCallback((item: ListItem) => {
    const id = item?.id ?? item?.label ?? item?.key ?? item?.uuid ?? item?.name;
    if (id != null) return toListItemKey(id);
    // Stable content-based fallback when no explicit ID field exists
    const firstValue = Object.values(item).find((v) => v != null);
    return firstValue == null ? 'item' : toListItemKey(firstValue).slice(0, 50);
  }, []);

  const isHorizontal = orientation === 'horizontal';

  const memoizedRenderItem = useCallback(
    (info: Parameters<ListRenderItem<ListItem>>[0]) => renderItem(info),
    [renderItem],
  );

  // Create header component for start spacing
  const ListHeaderComponent = useMemo(
    () =>
      startSpacing ? (
        <View
          style={
            isHorizontal ? { width: startSpacing } : { height: startSpacing }
          }
        />
      ) : null,
    [isHorizontal, startSpacing],
  );

  // Create separator component for item spacing
  const ItemSeparatorComponent = useMemo(
    () =>
      itemSpacing
        ? () => <SpacerView isHorizontal={isHorizontal} spacing={itemSpacing} />
        : undefined,
    [isHorizontal, itemSpacing],
  );

  // Create footer component for end spacing
  const ListFooterComponent = useMemo(
    () =>
      endSpacing ? (
        <View
          style={isHorizontal ? { width: endSpacing } : { height: endSpacing }}
        />
      ) : null,
    [isHorizontal, endSpacing],
  );

  if (!isHorizontal) {
    return (
      <>
        <LoadingIndicator
          style={styles.loadingIndicator}
          loading={loading}
          testID={`loadingView-${testId}`}
        />
        <View testID={`list-${testId}`} style={[listStyle, contentLayoutStyle]}>
          {startSpacing ? <View style={{ height: startSpacing }} /> : null}
          {(Array.isArray(data) ? data : []).map((item, index) => (
            <React.Fragment key={keyExtractor(item)}>
              {index > 0 && itemSpacing ? (
                <View style={{ height: itemSpacing }} />
              ) : null}
              {memoizedRenderItem({
                item,
                index,
                separators: {
                  highlight: () => {},
                  unhighlight: () => {},
                  updateProps: () => {},
                },
              })}
            </React.Fragment>
          ))}
          {endSpacing ? <View style={{ height: endSpacing }} /> : null}
        </View>
      </>
    );
  }

  return (
    <>
      <LoadingIndicator
        style={styles.loadingIndicator}
        loading={loading}
        testID={`loadingView-${testId}`}
      />
      <FlatList
        testID={`list-${testId}`}
        horizontal={isHorizontal}
        data={data}
        renderItem={memoizedRenderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListFooterComponent={ListFooterComponent}
        style={[{ flexGrow: 0 }, listStyle]}
        contentContainerStyle={contentLayoutStyle}
        {...restProps}
      />
    </>
  );
};

export default ASListView;

const styles = StyleSheet.create({
  loadingIndicator: {
    marginVertical: 8,
  },
});

// Note: ASListView example
/*
// Vertical list with spacing
<ASListView 
  data={[{id: '1', title: 'Item 1'},
         {id: '2', title: 'Item 2'},
         {id: '3', title: 'Item 3'}]}
  numColumns={3}
  startSpacing={20}
  itemSpacing={12}
  endSpacing={50}
  renderItem={({item}: { item: ListItem }) => {
    return (
      <ASColumn style={{alignItems:'center'}}>
        <ASText style={{flex:1, backgroundColor:'red'}}>{item?.title}</ASText>
      </ASColumn>
    )
  }}
/>

// Horizontal list with spacing
<ASListView 
  orientation="horizontal"
  data={[{id: '1', title: 'Item 1'},
         {id: '2', title: 'Item 2'},
         {id: '3', title: 'Item 3'}]}
  startSpacing={16}
  itemSpacing={12}
  endSpacing={32}
  renderItem={({item}: { item: ListItem }) => {
    return (
      <ASColumn style={{alignItems:'center'}}>
        <ASText style={{flex:1, backgroundColor:'red'}}>{item?.title}</ASText>
      </ASColumn>
    )
  }}
/>
*/
