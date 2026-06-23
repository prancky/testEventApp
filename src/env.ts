import config from 'react-native-config';

const env = {
  api: {
    accountOriginationService: config['ACCOUNT_ORIGINATION_SERVICE'],
    recommendationService: config['RECOMMENDATION_SERVICE'],
    proxyUrl: config['PROXY_URL'],
    API_KEY_HEADER: config['API_KEY_HEADER'],
  },
};

export default env;
