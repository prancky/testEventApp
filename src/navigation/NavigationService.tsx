import { createRef } from 'react';
import { NavigationContainerRef, StackActions } from '@react-navigation/native';

export const navigationRef = createRef<NavigationContainerRef>();

class NavigationService {
  navigate = (routeName: string, params?: object) => {
    navigationRef.current?.navigate(routeName, params);
  };

  goBack = () => {
    navigationRef.current?.goBack();
  };

  popToTop = () => {
    navigationRef.current?.dispatch(StackActions.popToTop());
  };
}

const instance = new NavigationService();
export default instance;
