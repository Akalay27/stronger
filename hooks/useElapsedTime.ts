import { useEffect, useState } from 'react';

function useElapsedTime(startTime: number): String {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const start = startTime;
        const interval = setInterval(() => {
            setElapsedTime(Date.now() - start);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    return formatElapsedTime(elapsedTime);
}

const formatElapsedTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours <= 0) {
        return `${padZero(minutes)}:${padZero(seconds)}`;
    }
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
};
const padZero = (num: number): string => {
    return num.toString().padStart(2, '0');
};

export default useElapsedTime;
