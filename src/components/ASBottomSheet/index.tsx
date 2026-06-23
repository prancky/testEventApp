import ASButton from '../ASButton';
import React, { ReactNode } from 'react';
import {
  Dimensions,
  SafeAreaView,
  View,
  ViewStyle,
  StyleSheet,
  TextStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import { CloseIcon } from '../../assets/icon';
import ASRow from '../ASRow';
import ASText from '../ASText';

const deviceHeight = Dimensions.get('screen').height;

export type BottomSheetModalProps = {
  isVisible?: boolean;
  children: ReactNode;
  backdropOpacity?: number;
  animationIn?: 'fadeIn' | 'slideInUp' | 'zoomIn' | 'slideInRight';
  animationOut?: 'fadeOut' | 'slideOutDown' | 'zoomOut' | 'slideOutRight';
  animationInTiming?: number;
  animationOutTiming?: number;
  avoidKeyboard?: boolean;
  height: number;
  label?: string;
  labelTextStyles?: TextStyle;
  onBackButtonPress?: () => void;
  onBackdropPress?: () => void;
  onClose: () => void;
  testId?: string;
};

const ASBottomSheet = (props: BottomSheetModalProps) => {
  const {
    children,
    backdropOpacity,
    height,
    onClose,
    label,
    labelTextStyles,
    testId = 'ASBottomSheet',
    ...restProps
  } = props;

  return (
    <Modal
      deviceHeight={deviceHeight}
      backdropTransitionInTiming={50}
      backdropTransitionOutTiming={50}
      hideModalContentWhileAnimating
      useNativeDriverForBackdrop
      useNativeDriver
      backdropOpacity={backdropOpacity}
      statusBarTranslucent
      style={styles.modalStyle}
      onModalHide={onClose}
      testID={`modal-${testId}`}
      {...restProps}
    >
      <View style={[styles.containerStyle, { height: height } as ViewStyle]}>
        <ASRow style={styles.headerRow}>
          {label && (
            <ASText
              testID={`label-${testId}`}
              style={[styles.titleStyle, labelTextStyles]}
            >
              {label}
            </ASText>
          )}
          <ASButton
            testID={`closeButton-${testId}`}
            onPress={() => onClose()}
            style={styles.closeButtonStyle}
          >
            <CloseIcon />
          </ASButton>
        </ASRow>
        <SafeAreaView
          testID={`view-${testId}`}
          style={styles.contentContainerStyle}
        >
          {children}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

ASBottomSheet.defaultProps = {
  isVisible: false,
  backdropOpacity: 0.5,
  animationIn: 'slideInUp',
  animationOut: 'slideOutDown',
};

const styles = StyleSheet.create({
  modalStyle: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  containerStyle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'white',
  },
  headerRow: {
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainerStyle: {
    justifyContent: 'center',
    top: 24,
    paddingHorizontal: 16,
  },
  closeButtonStyle: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  titleStyle: {
    flex: 1,
    textAlign: 'center',
    top: 12,
  },
});

export default ASBottomSheet;
