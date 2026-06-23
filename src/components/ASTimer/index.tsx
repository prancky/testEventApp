import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, TextStyle } from 'react-native';
import ASText from '../ASText';

export type ASTimerProps = {
  initialTime: number; // Initial time in seconds
  textStyle?: StyleProp<TextStyle>;
  onFinish: () => void | undefined;
};

const ASTimer: React.FC<ASTimerProps> = (props: ASTimerProps) => {
  const { initialTime, textStyle, onFinish, ...restProps } = props || {};
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime: number) => prevTime - 1);
      }, 1000);
    } else {
      onFinish?.();
    }
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <ASText style={[styles.timerStyle, textStyle]} {...restProps}>
      {formatTime(timeRemaining)}
    </ASText>
  );
};

const styles = StyleSheet.create({
  timerStyle: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ASTimer;

// Note: ASTimer Example
/*
         <ASTimer initialTime={62} onFinish={()=>{}}/>
* */
