import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toNumber } from '../../utils/common.utils';
import CustomIcon from '../CustomIcon';

type BackButtonProps = {
  isEnabled: boolean;
  icon: React.ReactNode | string;
  color?: string;
  size?: number | string;
  isLargerBackButton?: boolean;
  onPress?: () => void;
};

type HeaderTitleProps = {
  title: string;
  textStyles?: TextStyle;
  alignment?: 'left' | 'center' | 'right';
};

type ActionItem = {
  icon: React.ReactNode | string;
  iconSize?: number | string;
  alignment: 'left' | 'right';
  onPress: () => void;
  color?: string;
};

type ASAppHeaderProps = {
  styles?: ViewStyle;
  backButton?: BackButtonProps;
  headerTitle: HeaderTitleProps;
  actions?: ActionItem[];
  isPreview?: boolean;
};

const ASAppHeader: React.FC<ASAppHeaderProps> = ({
  styles: customStyles = {},
  backButton,
  headerTitle,
  actions = [],
  isPreview,
  ...restProps
}: ASAppHeaderProps) => {
  const renderActions = (alignment: 'left' | 'right') => {
    const filteredActions = actions
      .filter((action) => action.alignment === alignment)
      .map((action, i) => ({
        ...action,
        _key: `header-action-${alignment}-${typeof action.icon === 'string' ? action.icon : 'node'}-${i}`,
        _testId: `header-action-${alignment}-${i}`,
        _isLast: false,
      }));
    if (filteredActions.length > 0) {
      filteredActions.at(-1)._isLast = true;
    }
    return filteredActions.map((action) => (
      <TouchableOpacity
        key={action._key}
        onPress={action.onPress}
        testID={action._testId}
        style={[
          stylesObj.actionButton,
          action._isLast ? { marginRight: 0 } : null,
        ]}
      >
        <CustomIcon
          icon={action.icon}
          size={action.iconSize}
          color={action.color}
        />
      </TouchableOpacity>
    ));
  };

  const renderBackButton = () => {
    if (!backButton?.isEnabled) return null;

    const btn = (
      <TouchableOpacity
        onPress={backButton.onPress}
        style={stylesObj.backButton}
        testID={'header-back-button'}
      >
        <CustomIcon
          icon={backButton.icon}
          size={backButton.size}
          color={backButton.color}
        />
      </TouchableOpacity>
    );

    if (backButton.isLargerBackButton) {
      return <View style={stylesObj.fullRowBack}>{btn}</View>;
    }

    return btn;
  };

  const safeAreaInsets = useSafeAreaInsets();
  const insets = isPreview ? null : safeAreaInsets;

  return (
    <View
      {...restProps}
      style={[
        customStyles,
        {
          paddingTop: toNumber(customStyles?.paddingTop) + (insets?.top ?? 0), // Handle safe area view
          ...(typeof customStyles?.height === 'number'
            ? { height: customStyles.height + (insets?.top ?? 0) }
            : {}), // Only override height if it's a number
        },
      ]}
    >
      {backButton?.isEnabled &&
        backButton.isLargerBackButton &&
        renderBackButton()}
      {/* Full row back button (if enabled) */}
      {/* Main app header */}
      <View style={stylesObj.headerContainer}>
        <View style={stylesObj.leftContainer}>
          {!backButton?.isLargerBackButton && renderBackButton()}
          {renderActions('left')}
        </View>

        {/* Title */}
        <Text
          style={[
            stylesObj.titleLabel,
            headerTitle.textStyles,
            { textAlign: headerTitle.alignment },
          ]}
          numberOfLines={1}
        >
          {headerTitle.title}
        </Text>

        <View style={stylesObj.rightContainer}>{renderActions('right')}</View>
      </View>
    </View>
  );
};

const stylesObj = StyleSheet.create({
  titleLabel: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  backButton: {
    flex: 1,
  },
  fullRowBack: {
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  actionButton: {},
});

export default ASAppHeader;
