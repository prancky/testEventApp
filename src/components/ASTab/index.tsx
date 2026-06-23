import React, { ReactNode, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextStyle,
  ViewStyle,
} from 'react-native';

import { getPlatformShadowStyle } from '../../utils/common.utils';
import CustomIcon from '../CustomIcon';

type TabIcon = React.ComponentProps<typeof CustomIcon>['icon'];

type TabProps = {
  name: string;
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'top' | 'bottom' | 'left' | 'right';
  isDefaultTab?: boolean;
};

export type TabsProps = {
  children: React.ReactElement<TabProps>[];
  activeTabName: string;
  onTabPress?: (name: string) => void;
  activeTabTextColor?: string;
  activeTabBorderColor?: string;
  activeTabBackgroundColor?: string;
  tabHeaderTypography?: TextStyle;
  activeTabTextTypography?: TextStyle;
  tabHeaderStyle: ViewStyle;
  enableShadow?: boolean;
  id?: string;
  contentOffset: number;
  tabViewStyle: ViewStyle;
  iconStyle?: ViewStyle;
  style: ViewStyle;
  tabTitleOffset?: number;
  testId?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';
};

const ASTabs: React.FC<TabsProps> = ({
  children,
  activeTabName,
  onTabPress,
  activeTabTextColor,
  activeTabBorderColor = 'white',
  activeTabBackgroundColor,
  tabHeaderTypography,
  activeTabTextTypography,
  tabHeaderStyle,
  enableShadow = true,
  contentOffset = 1,
  tabViewStyle,
  style,
  id,
  testId = 'ASTabs',
  tabTitleOffset = 8,
  crossOrigin,
  iconPosition,
  iconStyle,
}) => {
  const safeChildren = React.Children.toArray(
    children,
  ) as React.ReactElement<TabProps>[];

  const getDefaultTab = () => {
    if (activeTabName) return activeTabName;
    if (!safeChildren.length) return '';
    const defaultTab = safeChildren.find((child) => child.props.isDefaultTab);
    return defaultTab?.props?.name || safeChildren[0]?.props?.name;
  };

  const [activeTab, setActiveTab] = useState<string>(getDefaultTab());

  const handleTabPress = (name: string) => {
    setActiveTab(name);
    if (onTabPress) onTabPress(name);
  };

  const flattenedTabHeaderStyle = StyleSheet.flatten(tabHeaderStyle);
  const hedaerBackgroundColor =
    flattenedTabHeaderStyle?.backgroundColor || 'white';
  const borderRadius = flattenedTabHeaderStyle?.borderRadius || 8;
  const width = flattenedTabHeaderStyle?.width || '90%';
  const maxHeight = flattenedTabHeaderStyle?.height || 50;
  const height = flattenedTabHeaderStyle?.height || 50;
  const platformShadowStyle = getPlatformShadowStyle(tabHeaderStyle);

  const renderIcon = (icon: TabIcon) => {
    return (
      <CustomIcon
        icon={icon}
        size={iconStyle?.iconSize}
        color={iconStyle?.color}
        crossOrigin={crossOrigin}
      />
    );
  };

  return (
    <View
      testID={`view-${testId}`}
      style={[
        styles.container,
        style,
        { backgroundColor: 'rgba(52, 52, 52, alpha)' },
      ]}
      id={id}
    >
      {/* Scrollable Tab Headers */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={[
          styles.tabHeaderScroll,
          {
            backgroundColor: hedaerBackgroundColor,
            borderRadius: borderRadius,
            width: width,
            maxHeight: maxHeight,
            height: height,
            display: 'flex',
            flexDirection: 'row',
          },
          platformShadowStyle,
        ]}
        testID={`scrollView-${testId}`}
      >
        {safeChildren.map((child) => {
          const icoPosition = iconPosition || 'left';
          const isVertical = icoPosition === 'top' || icoPosition === 'bottom';

          return (
            <TouchableOpacity
              key={child.props.name}
              style={[
                styles.tab,
                {
                  paddingHorizontal: tabTitleOffset,
                  flex: 1,
                  height: '100%',
                  borderBottomColor:
                    activeTab === child.props.name
                      ? activeTabBorderColor
                      : 'transparent',
                  backgroundColor:
                    activeTab === child.props.name && activeTabBackgroundColor
                      ? activeTabBackgroundColor
                      : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
              onPress={() => handleTabPress(child.props.name)}
              testID={`button-${testId}`}
            >
              <View
                style={[
                  styles.tabContent,
                  {
                    flexDirection: isVertical ? 'column' : 'row',
                  },
                ]}
              >
                {(icoPosition === 'top' || icoPosition === 'left') &&
                  child.props.icon && (
                    <View>{renderIcon(child.props.icon)}</View>
                  )}
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tabText,
                    tabHeaderTypography,
                    activeTab === child.props.name && activeTabTextTypography,
                    activeTab === child.props.name && {
                      color: activeTabTextColor,
                    },
                  ]}
                  testID={`title-${testId}`}
                >
                  {child.props.title}
                </Text>
                {(icoPosition === 'bottom' || icoPosition === 'right') &&
                  child.props.icon && (
                    <View>{renderIcon(child.props.icon)}</View>
                  )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tab Content */}
      <View
        testID={`contentView-${testId}`}
        style={[
          styles.contentContainer,
          tabViewStyle,
          { marginTop: contentOffset },
        ]}
      >
        {safeChildren.map((child) => {
          if (child.props.name === activeTab) {
            return (
              <View key={child.props.name} style={[styles.content]}>
                {child}
              </View>
            );
          }
          return null;
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flexDirection: 'row',
    verticalAlign: 'middle',
    alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    flex: 1,
  },
  tabHeaderScroll: {
    alignSelf: 'center',
    alignContent: 'center',
  },
  tab: {
    // paddingHorizontal: 20,
    alignItems: 'center',
    textAlign: 'center',
    borderBottomWidth: 2,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    color: '#333',
  },
  contentContainer: {
    flex: 1,
    minHeight: 50,
    marginTop: 1,
  },
  content: {
    flex: 1,
  },
});

export default ASTabs;
