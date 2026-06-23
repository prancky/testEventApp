import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Calendar, CalendarProps, DateData } from 'react-native-calendars';
import { addDays, format, isBefore, parseISO } from 'date-fns';

type PeriodDateSelection = {
  startingDay: string;
  endingDay?: string;
};

type MarkedDateValue = {
  startingDay?: boolean;
  endingDay?: boolean;
  textColor?: string;
};

type MarkedDateMap = Record<string, MarkedDateValue>;

export type ASCalendarProps = CalendarProps & {
  onChange?: (dates: string | PeriodDateSelection) => void;
  selectedDayBackgroundColor: string;
  selectedDayTextColor: string;
  todayTextColor: string;
  arrowColor: string;
  dayTextColor: string;
  calendarBackground: string;
  textSectionTitleColor: string;
  testId?: string;
};

const ASCalendar: React.FC<ASCalendarProps> = (props: ASCalendarProps) => {
  const {
    style,
    markedDates,
    markingType,
    minDate,
    onChange,
    selectedDayBackgroundColor,
    selectedDayTextColor,
    todayTextColor,
    arrowColor,
    dayTextColor,
    calendarBackground,
    textSectionTitleColor,
    testId = 'ASCalendar',
    ...restProps
  } = props;
  const [selected, setSelected] = useState<string>('');
  const [markedDatesState, setMarkedDatesState] = useState<MarkedDateMap>();
  const [periodMarking, setPeriodMarking] = useState<string[]>([]);
  const isMarkingTypePeriod = markingType === 'period';

  const generateDateList = (startDateStr: string, endDateStr: string) => {
    const startDate = parseISO(startDateStr);
    const endDate = parseISO(endDateStr);
    const dates: string[] = [];
    let currentDate = startDate;

    while (isBefore(currentDate, endDate)) {
      dates.push(format(currentDate, 'yyyy-MM-dd'));
      currentDate = addDays(currentDate, 1);
    }

    dates.push(format(endDate, 'yyyy-MM-dd'));
    return dates;
  };

  const getMinDate = () => {
    if (isMarkingTypePeriod && !!periodMarking[0]) {
      return periodMarking[0];
    }
    return minDate;
  };

  useEffect(() => {
    if (isMarkingTypePeriod) {
      if (!periodMarking || periodMarking?.length === 0) {
        setMarkedDatesState([]);
      }

      if (periodMarking?.[0]) {
        setMarkedDatesState({
          [periodMarking[0]]: {
            startingDay: true,
          },
        });
      }

      if (periodMarking.length === 2) {
        const periodDateList = generateDateList(
          periodMarking[0],
          periodMarking[1],
        );
        const res: MarkedDateMap = {};

        for (let date of periodDateList) {
          res[date] = {
            startingDay: periodDateList.indexOf(date) === 0,
            endingDay:
              periodDateList.indexOf(date) === periodDateList.length - 1,
            textColor: dayTextColor,
          };
        }
        setMarkedDatesState(res);
      }
    }
  }, [periodMarking, isMarkingTypePeriod]);

  const onDayPress = (day: DateData) => {
    if (isMarkingTypePeriod) {
      const responsePeriodDates: PeriodDateSelection = {};
      if (periodMarking[0]) {
        setPeriodMarking([periodMarking?.[0], day.dateString]);
        responsePeriodDates.startingDay = periodMarking?.[0];
        responsePeriodDates.endingDay = day.dateString;
      } else {
        setPeriodMarking([day.dateString]);
        responsePeriodDates.startingDay = day.dateString;
      }

      if (periodMarking?.[0] === day.dateString) {
        setPeriodMarking([]);
      }
      onChange?.(responsePeriodDates);
    } else {
      setSelected(day.dateString);
      onChange?.(day.dateString);
    }
  };

  return (
    <Calendar
      testID={testId}
      onDayPress={onDayPress}
      initialDate={new Date().toDateString()}
      allowSelectionOutOfRange={false}
      hideExtraDays
      minDate={getMinDate()}
      theme={{
        selectedDayBackgroundColor: selectedDayBackgroundColor,
        selectedDayTextColor: selectedDayTextColor,
        arrowColor: arrowColor,
      }}
      markedDates={{
        [selected]: {
          selected: true,
          disableTouchEvent: true,
        },
        ...markedDatesState,
        ...markedDates,
      }}
      markingType={markingType}
      style={[styles.calendarStyles, style]}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  calendarStyles: {},
});

export default ASCalendar;
