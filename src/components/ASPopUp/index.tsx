import React, { ReactNode } from 'react';
import {
  Modal,
  ModalProps,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import ASButton from '../ASButton';
import ASText from '../ASText';

export type ASPopUpProps = ModalProps & {
  children: ReactNode | ((onPressBackground?: () => void) => ReactNode);
  visible: boolean;
  isShowCloseIcon?: boolean;
  onClose: () => void;
  testId?: string;
  containerStyles?: StyleProp<ViewStyle>;
  closeButtonStyles?: StyleProp<ViewStyle>;
  closeIconTextStyles?: StyleProp<TextStyle>;
};

const ASPopUp: React.FC<ASPopUpProps> = (props: ASPopUpProps) => {
  const {
    children,
    visible,
    isShowCloseIcon,
    onClose,
    testId = 'ASPopUp',
    containerStyles,
    closeButtonStyles,
    closeIconTextStyles,
    ...restProps
  } = props;

  return (
    <Modal
      style={styles.modalContainer}
      testID={`modalView-${testId}`}
      animationType={'fade'}
      transparent={true}
      visible={visible}
      onRequestClose={() => {}}
      {...restProps}
    >
      <View style={[styles.container, containerStyles]}>{children}</View>
      {isShowCloseIcon && (
        <ASButton
          testID={`closeButton-${testId}`}
          style={[styles.closeButton, closeButtonStyles]}
          onPress={onClose}
        >
          <ASText
            testID={`closeLabel-${testId}`}
            style={[styles.closeIconText, closeIconTextStyles]}
          >
            X
          </ASText>
        </ASButton>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#fff',
    borderRadius: 50,
    position: 'absolute',
    top: 40,
    right: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {},
});

export default ASPopUp;
