import * as React from 'react';

export default <T>(value: T, ms: number) => {
    const [currentValue, setCurrentValue] = React.useState(value);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setCurrentValue(value);
        }, ms);

        return () => {
            clearTimeout(timeout);
        };
    }, [value, ms]);

    return currentValue;
}