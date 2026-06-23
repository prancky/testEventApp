import { DeviceEventEmitter } from 'react-native';
import { authApiClient } from './AuthApiClient';
import { Service } from '../Service';

interface AuthorizationConfigs {
  appId?: string;
  envId?: string;
  bankId?: string;
  codeVerifier?: string;
  codeChallenge?: string;
  redirectUrl?: string;
  apiBaseUrl?: string;
  authBaseUrl?: string;
  enterpriseDataServicesBaseUrl?: string;
}

export class AuthorizationClient {
  static configure(arg0: AuthorizationConfigs) {
    throw new Error('Method not implemented.');
  }
  private static _instance: AuthorizationClient = new AuthorizationClient();

  private _configs?: AuthorizationConfigs;

  constructor() {
    if (AuthorizationClient._instance) {
      throw new Error(
        'Error: Instantiation failed: Use AuthorizationClient.instance() instead of new.',
      );
    }
    AuthorizationClient._instance = this;
  }

  public static instance(): AuthorizationClient {
    return AuthorizationClient._instance;
  }

  public configure(configs: AuthorizationConfigs) {
    return new Promise<void>((resolve) => {
      this._configs = configs;
      // Configure the authApiClient and Service with the provided configs
      authApiClient.configure(configs);
      Service.configure(configs);
      resolve();
    });
  }

  public getConfigs(): AuthorizationConfigs {
    if (this._configs === undefined) {
      throw new Error(
        'Error: AuthorizationClient must be configured before using',
      );
    }
    return this._configs;
  }

  public addSessionListener(listener: (data: unknown) => void) {
    DeviceEventEmitter.addListener('authcomponent.session.expired', listener);
  }

  public removeSessionListener(listener: (...args: unknown[]) => void) {
    DeviceEventEmitter.removeListener(
      'authcomponent.session.expired',
      listener,
    );
  }
}
