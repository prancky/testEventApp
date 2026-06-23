export const cleanUrl = (rawUrl: string): string => {
  const urlParts = rawUrl.split('?');
  if (urlParts.length <= 1) return urlParts[0];
  const params = urlParts[1].split('&').filter((param: string) => {
    const value = param.split('=')[1];
    return (
      value !== 'undefined' &&
      value !== 'null' &&
      value !== '' &&
      value !== '""' &&
      value !== 'eq.' &&
      !value?.includes('.undefined') &&
      !value?.includes('.null') &&
      !value?.endsWith('.')
    );
  });
  return params.length > 0 ? `${urlParts[0]}?${params.join('&')}` : urlParts[0];
};

export const cleanBody = (
  body: Record<string, unknown>,
): Record<string, unknown> => {
  if (body && typeof body === 'object') {
    const cleaned = Object.fromEntries(
      Object.entries(body).filter(
        ([_, value]) => value !== undefined && value !== '',
      ),
    );
    delete cleaned['accessToken'];
    return cleaned;
  }
  return body;
};

// Returns true when an HTTP response carries a 2xx status. Extracted here so
// workflow step guards can read isSuccessStatus(resp) instead of inlining the
// range comparison, which keeps the generated orchestration methods below the
// cognitive-complexity threshold.
export const isSuccessStatus = (response: { status?: number }): boolean => {
  const status = response?.status;
  return status !== undefined && status >= 200 && status < 300;
};

export const cleanArrayBody = <T,>(body: T[]): T[] => {
  if (body && Array.isArray(body)) {
    return body.map((item: any) => {
      if (item && typeof item === 'object') {
        const filtered = Object.fromEntries(
          Object.entries(item).filter(
            ([key, value]) => value !== undefined && key !== 'accessToken',
          ),
        );
        return filtered as T;
      }
      return item;
    });
  }
  return body;
};
