import { writable } from "svelte/store";
import { Storage } from "@capacitor/storage";
import type { TimerEntity } from "@entities/TimerEntity";

const STORAGE_TIMERS_KEY = "timers";

let _timers = [] as TimerEntity[];
export const timers = writable(_timers);

export function addTimer(name: string): Promise<void> {
    console.log("New timer:", name);
    _timers = [..._timers, {name: name, time: 0, archived: false}];
    return saveState();
}

export function removeTimer(timerToRemove: TimerEntity): Promise<void> {
    console.log("Removed timer:", timerToRemove);
    _timers = _timers.filter(timer => timer != timerToRemove);
    return saveState();
}

export function moveTimer(from: number, to: number): Promise<void> {
    console.log("Moving timer from ", from, "to", to);
    console.log(_timers.map(timer => timer.name));
    const movedElement = _timers[from]
    _timers.splice(from, 1);
    _timers.splice(to, 0, movedElement);
    console.log(_timers.map(timer => timer.name));
    return saveState();
}

export async function saveState(): Promise<void> {
    await Storage.set({
        key: STORAGE_TIMERS_KEY,
        value: JSON.stringify(_timers)
    });
    timers.set(_timers);
}

export async function loadState(): Promise<void> {
    _timers = JSON.parse((await Storage.get({key: STORAGE_TIMERS_KEY})).value) ?? [];
    timers.set(_timers);
}