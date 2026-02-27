import React, { useContext } from "react";

const CommonContext = React.createContext();

export const CommonContextProvider = ({ children }) => {

    function dateFormat(inputDate) {
        // 1. Create a Date object (replacing space with T for standard ISO parsing)
        const dateObj = new Date(inputDate.replace(" ", "T"));

        // 2. Format using Intl.DateTimeFormat
        const formatter = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        // 3. Format and clean up (replacing comma between month and year if necessary)
        // "12 Feb 2026, 10:42" -> "12 Feb, 2026 10:42 AM"
        let formattedDate = formatter.format(dateObj).replace(",", "");
        // Re-format to match "12 Feb, 2026 10:42 AM" exactly
        const parts = formattedDate.split(' ');
        const finalDate = `${parts[0]} ${parts[1]}, ${parts[2]} ${parts[3]} AM`;
        // Note: Intl adds comma differently based on locale, adjust formatting accordingly.
        // Better, cleaner approach using manual formatting for specific output:

        const day = dateObj.getDate();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        const hour = dateObj.getHours() % 12 || 12;
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        const ampm = dateObj.getHours() >= 12 ? 'PM' : 'AM';

        const result = `${day} ${month}, ${year} ${hour}:${minutes} ${ampm}`;
        return result; // "12 Feb, 2026 10:42 AM"

    }
    async function getItem(key) {
        try {
            const response = await AsyncStorage.getItem(key);
            return JSON.parse(response);
        } catch (error) {
            return undefined;
        }
    } 
    return (<CommonContext.Provider
        value={{
            dateFormat,
            getItem
        }}
    >
        {children}
    </CommonContext.Provider>)
}

export const useCommonContext = (() => {
    const value = useContext(CommonContext);
    if (!value) {
        throw new Error("useCommonContext must be wrapped inside a CommonContextProvider")
    }
    return value;
})
