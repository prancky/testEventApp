import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';

type LineType = 'ORDERED' | 'UNORDERED' | 'NONE';

export type ASTextProps = TextProps & {
  children?: string | number | React.ReactNode;
  style?: StyleProp<TextStyle>;
  labelType?: 'number' | 'datetime' | 'card-number' | 'expiry-date';
  label?: string;
  accessibilityLabel?: string;
  testId?: string;
  lineTypes?: LineType[];
  lineIndentations?: number[];
};

const TEXT_STYLE_KEYS = new Set([
  'color',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'letterSpacing',
  'lineHeight',
  'textAlign',
  'textAlignVertical',
  'textDecorationColor',
  'textDecorationLine',
  'textDecorationStyle',
  'textShadowColor',
  'textShadowOffset',
  'textShadowRadius',
  'textTransform',
  'whiteSpace',
  'writingDirection',
]);

function splitTextStyle(flatStyle: Record<string, unknown> | undefined): {
  viewStyle: Record<string, unknown>;
  textOnlyStyle: Record<string, unknown>;
} {
  const viewStyle: Record<string, unknown> = {};
  const textOnlyStyle: Record<string, unknown> = {};
  if (flatStyle) {
    for (const [k, v] of Object.entries(flatStyle)) {
      if (TEXT_STYLE_KEYS.has(k)) {
        textOnlyStyle[k] = v;
      } else {
        viewStyle[k] = v;
      }
    }
  }
  return { viewStyle, textOnlyStyle };
}

type LineMeta = {
  line: string;
  marker: string;
  indent: number;
  lineKey: string;
};

function buildLineMetas(
  lines: string[],
  lineTypes: LineType[],
  lineIndentations: number[] | undefined,
): LineMeta[] {
  let orderedCounter = 0;
  return lines.map((line, i) => {
    const lineType = lineTypes[i] ?? 'NONE';
    const indent = (lineIndentations?.[i] ?? 0) * 16;
    let marker = '';
    if (lineType === 'UNORDERED') {
      marker = '• ';
      orderedCounter = 0;
    } else if (lineType === 'ORDERED') {
      orderedCounter += 1;
      marker = `${orderedCounter}. `;
    } else {
      orderedCounter = 0;
    }
    return { line, marker, indent, lineKey: `line-${i}-${line?.slice(0, 20)}` };
  });
}

function resolveTextStyle(
  props: ASTextProps,
  flatStyle: any,
  truncationStyle: object,
): StyleProp<TextStyle> {
  if (props?.numberOfLines === 1) {
    return [
      flatStyle,
      truncationStyle,
      Platform.select({ web: { whiteSpace: 'nowrap' } as any, default: {} }),
    ];
  }
  if (props?.numberOfLines) {
    return [flatStyle, truncationStyle];
  }
  return flatStyle;
}

function formatLabelValue(
  labelType: string | undefined,
  value: unknown,
): string {
  if (
    labelType === 'number' &&
    value !== '' &&
    value !== null &&
    value !== 'undefined' &&
    (typeof value === 'string' || typeof value === 'number')
  ) {
    return Number.parseFloat(
      value?.toString()?.replace(',', ''),
    ).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (labelType === 'datetime' && typeof value === 'number') {
    const date = new Date(value);
    const options: { [key: string]: string } = {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    const dateFormatter = new Intl.DateTimeFormat('en-US', options);
    const parts = dateFormatter.formatToParts(date);
    type DateTimePart = Intl.DateTimeFormatPart;
    return (
      `${parts?.find((part: DateTimePart) => part.type === 'weekday')?.value}, ` +
      `${parts?.find((part: DateTimePart) => part.type === 'day')?.value} ` +
      `${parts?.find((part: DateTimePart) => part.type === 'month')?.value} ` +
      `${parts?.find((part: DateTimePart) => part.type === 'year')?.value}`
    );
  }
  if (
    labelType === 'expiry-date' &&
    (typeof value === 'string' || typeof value === 'number') &&
    value !== '' &&
    value !== 'undefined' &&
    value
  ) {
    return `${value.toString().slice(4)}/${value.toString().slice(0, 4)}`;
  }
  if (
    labelType === 'card-number' &&
    value &&
    (typeof value === 'string' || typeof value === 'number')
  ) {
    let cardNumberString = value?.toString().replaceAll(/\D/g, '');
    return cardNumberString?.replaceAll(/(.{4})/g, '$1 ').trim();
  }
  if (value === null || value === undefined) {
    // Preserve prior output ('undefined') so the null-guard in the
    // component body renders nothing for empty values.
    return 'undefined';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return `${value}`; // NOSONAR (S6551) — value is narrowed to number|boolean|bigint
  }
  return JSON.stringify(value);
}

const ASText: React.FC<ASTextProps> = (props: ASTextProps) => {
  const {
    children,
    labelType,
    label,
    testId = 'ASText',
    lineTypes,
    lineIndentations,
    ...restProps
  } = props || {};
  let labelValue =
    labelType === 'number' ? (children ?? label) : children || label;
  const flatStyle = StyleSheet.flatten(props?.style);
  const ellipsizeMode = props?.numberOfLines
    ? props?.ellipsizeMode || 'tail'
    : undefined;
  const truncationStyle =
    props?.numberOfLines && flatStyle?.overflow == null
      ? { overflow: 'hidden' as const }
      : {};
  const style = resolveTextStyle(props, flatStyle, truncationStyle);

  labelValue = formatLabelValue(labelType, labelValue);

  if (
    labelValue === null ||
    labelValue === 'undefined' ||
    labelValue === 'null' ||
    labelValue === undefined
  ) {
    return null;
  }

  if (lineTypes && lineTypes.length > 0 && typeof labelValue === 'string') {
    const linesWithMeta = buildLineMetas(
      labelValue.split('\n'),
      lineTypes,
      lineIndentations,
    );
    const { viewStyle, textOnlyStyle } = splitTextStyle(
      flatStyle as Record<string, unknown> | undefined,
    );
    return (
      <View testID={testId} style={viewStyle}>
        {linesWithMeta.map(({ line, marker, indent, lineKey }) => (
          <Text
            key={lineKey}
            {...restProps}
            style={[textOnlyStyle, { paddingLeft: indent }]}
          >
            {marker}
            {line}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <Text
      testID={testId}
      {...restProps}
      ellipsizeMode={ellipsizeMode}
      style={[style]}
    >
      {labelValue}
    </Text>
  );
};

const styles = StyleSheet.create({});

export default ASText;
