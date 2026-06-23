import React, { ReactNode } from 'react';

import { Formik, FormikConfig, FormikHelpers, FormikProps } from 'formik';

type FormValues = Record<string, unknown>;

export type ASFormProps = FormikConfig<FormValues> & {
  children: (formikProps: FormikProps<FormValues>) => ReactNode;
  onSubmit: (
    values: FormValues,
    formikHelpers: FormikHelpers<FormValues>,
  ) => void | Promise<unknown>;
  initialValues?: FormValues;
  validationSchema?: FormikConfig<FormValues>['validationSchema'];
  testId?: string;
};

const ASForm: React.FC<ASFormProps> = (props: ASFormProps) => {
  const {
    children,
    onSubmit,
    initialValues,
    validationSchema,
    testId = 'ASForm',
    ...restProps
  } = props || {};

  return (
    <Formik
      {...restProps}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      testID={testId}
    >
      {(formikProps: FormikProps<FormValues>) => {
        return <>{children?.(formikProps)}</>;
      }}
    </Formik>
  );
};

export default ASForm;
