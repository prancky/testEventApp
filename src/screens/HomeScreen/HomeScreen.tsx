import React, { useEffect } from 'react';

import { useNavigation } from '@react-navigation/native';

import { text, color } from '@/assets';

import { ASContainer, ASText } from '@/components';

import { Platform, StyleSheet } from 'react-native';

import { useClearHeaderActions } from '@/utils/screen.effects';
import { executeCustomFunction } from '@/extensions';

import { STRINGS } from '@/strings';

type ScreenRouteParams = {};

type ScreenProps = {
  route: {
    params: ScreenRouteParams;
  };
};

const HomeScreen: React.FC<ScreenProps> = ({ route }) => {
  const navigation = useNavigation();

  useEffect(() => {
    executeCustomFunction(
      'DashboardFunctions.handleManageBooks',
      navigation,
      {},
      {},
    );
  }, []);

  useClearHeaderActions(navigation);

  return (
    <ASContainer
      disabledSafeArea={false}
      isScrollable={true}
      backgroundImageResizeMode={'contain'}
      name={'ASContainer-826432'}
      testID={'d737e0aa-b3f6-4801-a57f-92e3b159abda'}
      style={styles.aSContainerStyle}
      testId={'ASContainer-826432'}
    >
      <ASText
        labelType={'string'}
        name={'welcomeText'}
        style={[text.heading.medium, styles.welcomeTextStyle]}
        dragStyle={styles.welcomeTextDragStyle}
        accessibilityLabel={STRINGS.HomeScreen.welcomeText.accessibilityLabel}
        testId={'welcomeText'}
      >
        {STRINGS.HomeScreen.welcomeText.label}
      </ASText>
    </ASContainer>
  );
};

const styles = StyleSheet.create({
  aSContainerStyle: {
    height: '100%',
    width: '100%',
    backgroundColor: color.surface.default,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  welcomeTextStyle: {
    marginTop: 50,
    alignSelf: 'center',
    textAlign: 'left',
    ...Platform.select({ web: { whiteSpace: 'pre-wrap' }, default: {} }),
  },
  welcomeTextDragStyle: { flexBasis: 'auto' },
});

export default HomeScreen;
