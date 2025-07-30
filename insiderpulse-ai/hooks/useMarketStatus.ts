import { useState, useEffect } from 'react';

const useMarketStatus = () => {
    const [status, setStatus] = useState({ isOpen: false, message: 'Calculating market status...' });

    useEffect(() => {
        const calculateStatus = () => {
            const now = new Date();
            // Use Intl.DateTimeFormat to get parts of the date in the target timezone
            const estOptions: Intl.DateTimeFormatOptions = { 
                timeZone: 'America/New_York', 
                weekday: 'short', 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false 
            };
            const estFormatter = new Intl.DateTimeFormat('en-US', estOptions);
            const parts = estFormatter.formatToParts(now);

            const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value || '';

            const day = getPart('weekday');
            const hour = parseInt(getPart('hour'));
            const minute = parseInt(getPart('minute'));

            const isWeekday = !['Sat', 'Sun'].includes(day);
            const marketOpenTime = 9 * 60 + 30; // 9:30 AM in minutes from midnight
            const marketCloseTime = 16 * 60; // 4:00 PM in minutes from midnight
            const currentTimeInMinutes = hour * 60 + minute;

            if (isWeekday) {
                if (currentTimeInMinutes >= marketOpenTime && currentTimeInMinutes < marketCloseTime) {
                    const minutesUntilClose = marketCloseTime - currentTimeInMinutes;
                    const h = Math.floor(minutesUntilClose / 60);
                    const m = Math.floor(minutesUntilClose % 60);
                    setStatus({ isOpen: true, message: `U.S. markets close in ${h}h ${m}m` });
                } else if (currentTimeInMinutes < marketOpenTime) {
                    const minutesUntilOpen = marketOpenTime - currentTimeInMinutes;
                    const h = Math.floor(minutesUntilOpen / 60);
                    const m = Math.floor(minutesUntilOpen % 60);
                    setStatus({ isOpen: false, message: `U.S. markets open in ${h}h ${m}m` });
                } else {
                    // After 4 PM on a weekday
                    setStatus({ isOpen: false, message: 'U.S. markets are closed' });
                }
            } else {
                 // Weekend
                setStatus({ isOpen: false, message: 'U.S. markets are closed' });
            }
        };

        calculateStatus(); // Initial calculation
        const intervalId = setInterval(calculateStatus, 60000); // Update every minute

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    return status;
};

export default useMarketStatus;
