import { ErrorDetail } from '@/redux/reducers/error';
import { AxiosError } from 'axios';
import { i18n } from '@/translations/translation-config';
import errorCodes from './error-codes';

export const getErrorDetails = (error?: Error) => {
  if (!error) {
    return undefined;
  }
  return handleCommonError(error);
};

export const handleCommonError = (
  error?: Error,
  requestName?: string,
): ErrorDetail => {
  let title = i18n.t('common.lbl_error');
  let message = i18n.t('common.msg_error');
  let errorCode;
  let errorId;
  if (error) {
    errorCode = (error as AxiosError)?.response?.status;
    errorId = (error as AxiosError)?.response?.data?.errors?.[0]?.code;
    if (errorCodes.includes(errorId)) {
      message = (error as AxiosError)?.response?.data?.errors?.[0]?.message;
    }
  }
  return {
    title,
    message,
    errorCode,
    errorId,
  };
};
