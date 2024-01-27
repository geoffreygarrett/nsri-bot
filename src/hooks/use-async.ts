import {useCallback, useEffect, useState} from "react"

// export default function useAsync(callback: () => Promise<any>, dependencies: any[] = []) {
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState()
//     const [value, setValue] = useState()
//
//     const callbackMemoized = useCallback(() => {
//         setLoading(true)
//         setError(undefined)
//         setValue(undefined)
//         callback()
//             .then(setValue)
//             .catch(setError)
//             .finally(() => setLoading(false))
//     }, dependencies)
//
//     useEffect(() => {
//         callbackMemoized()
//     }, [callbackMemoized])
//
//     return {loading, error, value}
// }

// type with generic to allow for type inference
// import { useState, useCallback, useEffect } from 'react';

export function useAsync<T = unknown>(callback: () => Promise<T>, dependencies: any[] = []) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>();
    const [value, setValue] = useState<T | undefined>();

    const callbackMemoized = useCallback(() => {
        setLoading(true);
        setError(undefined);
        setValue(undefined);
        callback()
            .then(setValue)
            .catch(setError)
            .finally(() => setLoading(false));
    }, dependencies);

    useEffect(() => {
        callbackMemoized();
    }, [callbackMemoized]);

    return { loading, error, value };
}
