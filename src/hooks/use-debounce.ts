"use client";

import {useEffect} from "react";
import useTimeout from "./use-timeout";


export default function useDebounce(callback: () => void, delay: number, dependencies: any[] = []) {
    const {reset, clear} = useTimeout(callback, delay)
    useEffect(reset, [...dependencies, reset])
    useEffect(clear, [])
}