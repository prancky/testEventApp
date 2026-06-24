import { Alert } from 'react-native';
import uuid from 'react-native-uuid';

/**
 * DashboardFunctions - Custom functions for the Dashboard screen
 *
 * @description Contains user-defined custom functions that can be triggered
 * by widget events (onPress, onLoad, etc.) via the Custom Function Registry.
 */
export class DashboardFunctions {
  static handleManageBooks = async (
    navigation: any,
    variables: any,
    params?: any,
  ): Promise<void> => {
    const actionId = uuid.v4();
    console.log(
      '[DashboardFunctions] handleManageBooks called, actionId:',
      actionId,
    );
    console.log('Variables:', JSON.stringify(variables, null, 2));

    Alert.alert(
      'Custom Function',
      `handleManageBooks executed!\nAction ID: ${actionId}`,
      [
        {
          text: 'Go to Home',
          onPress: () => {
            navigation.navigate('Home', {});
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };
}
