import { Alert } from 'react-native';
// @ts-ignore
import SNSMobileSDK from '@sumsub/react-native-mobilesdk-module';
import CryptoJS from 'crypto-js';
import uuid from 'react-native-uuid';
/**
 * SumsubFunctions - Custom functions for Sumsub KYC/KYB verification
 *
 * @description Contains custom functions to launch the Sumsub identity-verification
 * flow using the Sumsub Mobile SDK. Supports both:
 *   - **Individual (KYC)** verification – ID documents, selfie, proof of address
 *   - **Company (KYB)** verification – business documents, directors, UBOs
 *
 * Photo uploads from the device gallery/camera are enabled.
 *
 * ## Setup
 * 1. Set `SUMSUB_APP_TOKEN` and `SUMSUB_SECRET_KEY` below (or load from env/config).
 * 2. Configure the level names in your Sumsub dashboard and update
 *    `SUMSUB_INDIVIDUAL_LEVEL` / `SUMSUB_COMPANY_LEVEL` below.
 * 3. (Optional) Customise the `flowName`, theme colours, or locale.
 *
 * ⚠️  SECURITY WARNING: Embedding the secret key in a mobile app is acceptable
 *     only for development / demo purposes. In production, token generation
 *     should happen on your backend.
 */

// ----- Configuration --------------------------------------------------------

/** Sumsub API root URL */
const SUMSUB_BASE_URL = 'https://api.sumsub.com';

/** Your Sumsub App Token (from the Sumsub dashboard) */
const SUMSUB_APP_TOKEN =
  'sbx:tOVi9ZbWMbgONboL37YZ6B5Z.7raCTqhj93lUe60LLuwV33KM30hbLkcb';

/** Your Sumsub Secret Key (from the Sumsub dashboard) */
const SUMSUB_SECRET_KEY = 'hrTHLIYHLWD31cbFXt3z6S42zU6mJ3u3';

/** Verification level for Company (KYB) */
const SUMSUB_COMPANY_LEVEL = 'mobile';

/** Verification type: 'individual' or 'company' */
export type SumsubVerificationType = 'individual' | 'company';

/** Default token TTL in seconds */
const TOKEN_TTL_SECS = 6000;

// ----- HMAC-SHA256 Request Signing -------------------------------------------

/**
 * Signs a Sumsub API request using HMAC-SHA256, exactly matching
 * the Postman pre-request script from the "Sumsub SDK Auth" collection.
 *
 * Headers produced:
 *   - X-App-Token
 *   - X-App-Access-Ts
 *   - X-App-Access-Sig
 */
function buildSumsubHeaders(
  method: string,
  path: string,
  body: string = '',
): Record<string, string> {
  // 1. Timestamp (seconds since Unix epoch)
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // 2. String to sign = timestamp + HTTP method + path + body
  const stringToSign = timestamp + method.toUpperCase() + path + body;

  // 3. HMAC-SHA256 signature (hex, lowercase)
  const signature = CryptoJS.HmacSHA256(stringToSign, SUMSUB_SECRET_KEY)
    .toString(CryptoJS.enc.Hex)
    .toLowerCase();

  return {
    'Content-Type': 'application/json',
    'X-App-Token': SUMSUB_APP_TOKEN,
    'X-App-Access-Ts': timestamp,
    'X-App-Access-Sig': signature,
  };
}

// ----- Helpers ---------------------------------------------------------------

/**
 * Generates a Sumsub SDK access token by calling
 *   POST /resources/accessTokens/sdk
 * with HMAC-SHA256 signed headers.
 *
 * @param userId - A unique external user identifier (e.g. UUID).
 * @returns A fresh SDK access-token string.
 */
async function fetchAccessToken(
  userId: string,
  levelName: string,
): Promise<string> {
  const requestPath = '/resources/accessTokens/sdk';

  const requestBody = JSON.stringify({
    userId: userId,
    levelName: levelName,
    ttlInSecs: TOKEN_TTL_SECS,
  });

  const headers = buildSumsubHeaders('POST', requestPath, requestBody);

  console.log('[SumsubFunctions] Requesting SDK access token…');

  try {
    const response = await fetch(`${SUMSUB_BASE_URL}${requestPath}`, {
      method: 'POST',
      headers,
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Sumsub API error – HTTP ${response.status}: ${errorText}`,
      );
    }

    const data = await response.json();

    if (!data.token) {
      throw new Error('Sumsub API response did not contain a token');
    }

    console.log('[SumsubFunctions] Access token obtained successfully');
    return data.token;
  } catch (error: any) {
    console.error('[SumsubFunctions] fetchAccessToken error:', error);
    throw error;
  }
}

// ----- Custom Function -------------------------------------------------------

export class SumsubFunctions {
  /**
   * Launch the Sumsub identity-verification flow.
   *
   * @param navigation - React Navigation instance
   * @param variables - App global variables (globalData). If `variables.userId`
   *                     exists it will be forwarded when requesting the token.
   * @param params - Optional event-specific parameters. Supported keys:
   *                 - `accessToken`       (string)  – pre-fetched token (skips fetch)
   *                 - `flowName`          (string)  – Sumsub flow to use
   *                 - `locale`            (string)  – e.g. "en"
   *                 - `userId`            (string)  – override user id for token fetch
   *                 - `levelName`         (string)  – override verification level
   *                 - `verificationType`  ('individual' | 'company') – type of verification
   */
  static handleSumsubVerification = async (
    navigation: any,
    variables: any,
    params?: {
      accessToken?: string;
      flowName?: string;
      locale?: string;
      userId?: string;
      levelName?: string;
      verificationType?: SumsubVerificationType;
    },
  ): Promise<void> => {
    console.log('[SumsubFunctions] handleSumsubVerification called');

    try {
      // 1. Resolve user ID ------------------------------------------------
      const userId = uuid.v4();

      // 2. Resolve verification level -------------------------------------
      const levelName = SUMSUB_COMPANY_LEVEL;

      // 3. Resolve access token -------------------------------------------
      const accessToken =
        params?.accessToken ?? (await fetchAccessToken(userId, levelName));

      console.log('[SumsubFunctions] Access token ready');

      // 4. Token-expiration handler (called by SDK when token expires) -----
      const tokenExpirationHandler = async (): Promise<string> => {
        console.log('[SumsubFunctions] Token expired – refreshing…');
        return fetchAccessToken(userId, levelName);
      };

      // 5. Build & launch the SDK -----------------------------------------
      const snsMobileSDK = SNSMobileSDK.init(
        accessToken,
        tokenExpirationHandler,
      )
        .withHandlers({
          onStatusChanged: (event: any) => {
            console.log(
              '[SumsubFunctions] onStatusChanged: [' +
                event.prevStatus +
                '] => [' +
                event.newStatus +
                ']',
            );
          },
          onLog: (event: any) => {
            console.log('[SumsubFunctions] onLog: [Idensic] ' + event.message);
          },
          onEvent: (event: any) => {
            console.log('[SumsubFunctions] onEvent: ' + JSON.stringify(event));
          },
        })
        .withDebug(__DEV__)
        .withAutoCloseOnApprove(3)
        .withLocale(params?.locale ?? 'en');

      // Optionally set a specific flow
      if (params?.flowName) {
        snsMobileSDK.withFlowName(params.flowName);
      }

      const launchResult = await snsMobileSDK.build().launch();

      console.log(
        '[SumsubFunctions] SDK finished. Result:',
        JSON.stringify(launchResult),
      );

      // 6. Handle the result -----------------------------------------------
      if (launchResult.success) {
        Alert.alert(
          'Verification Complete',
          'Your identity verification has been submitted successfully.',
          [{ text: 'OK' }],
        );
      } else if (launchResult.status === 'Cancelled') {
        console.log('[SumsubFunctions] Verification cancelled by user');
      } else {
        Alert.alert(
          'Verification Incomplete',
          `Status: ${launchResult.status ?? 'Unknown'}\n${
            launchResult.errorMsg ?? ''
          }`,
          [{ text: 'OK' }],
        );
      }
    } catch (error: any) {
      console.error('[SumsubFunctions] Verification error:', error);
      Alert.alert(
        'Verification Error',
        error?.message ?? 'Something went wrong. Please try again later.',
        [{ text: 'OK' }],
      );
    }
  };
}
