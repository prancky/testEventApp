import React from 'react';
import { useNavigation } from '@react-navigation/native';

import { imageSources, space } from '@/assets';

import { ASContainer, ASColumn, ASImage } from '@/components';

import { Platform, StyleSheet } from 'react-native';
import { sharedStyles } from '@/components/shared/sharedStyles';

import { useClearHeaderActions } from '@/utils/screen.effects';

type ScreenRouteParams = {};

type ScreenProps = {
  route: {
    params: ScreenRouteParams;
  };
};

const LoginScreen: React.FC<ScreenProps> = ({ route }) => {
  const navigation = useNavigation();

  useClearHeaderActions(navigation);

  return (
    <ASContainer
      disabledSafeArea={false}
      isScrollable={true}
      backgroundImageResizeMode={'contain'}
      name={'ASContainer-462579'}
      testID={'5fab0c9f-f4eb-4bc7-a4b6-36b6ff373e88'}
      style={sharedStyles.container}
      testId={'ASContainer-462579'}
    >
      <ASColumn
        spacing={space['2']}
        scrollable={false}
        backgroundImageResizeMode={'contain'}
        scrollDirection={'vertical'}
        name={'mainContainer'}
        style={styles.mainContainerStyle}
        testId={'mainContainer'}
      >
        <ASImage
          resizeMethod={'auto'}
          roundImageSize={0}
          resizeMode={'contain'}
          source={imageSources.image__vqg6}
          name={'ASImage-974121'}
          hardCodeStyle={styles.aSImageHardCodeStyle}
          style={styles.aSImageStyle}
          testId={'ASImage-974121'}
        />
      </ASColumn>
    </ASContainer>
  );
};

const styles = StyleSheet.create({
  mainContainerStyle: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  aSImageHardCodeStyle: {
    backgroundColor: '#f0f0f0',
    color: '#999',
    fontSize: '12px',
    height: '100%',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    width: '100%',
    ...Platform.select({ web: { display: 'flex' }, default: {} }),
  },
  aSImageStyle: {
    width: 100,
    objectFit: 'contain',
    height: 100,
    flexBasis: 'auto',
  },
});

export default LoginScreen;
