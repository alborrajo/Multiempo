import { Writable, writable } from "svelte/store";
import { Storage } from "@capacitor/storage";
import type { TimerEntity } from "@entities/TimerEntity";

const STORAGE_TIMERS_KEY = "timers";

let _timers = [] as TimerEntity[];
export const timers = writable(_timers);

export function addTimer(name: string) {
    console.log("New timer:", name);
    _timers = [..._timers, {name: name, time: 0, archived: false}];
    timers.set(_timers);
    saveState();
}

export function removeTimer(timerToRemove: TimerEntity) {
    console.log("Removed timer:", timerToRemove);
    _timers = _timers.filter(timer => timer != timerToRemove);
    timers.set(_timers);
    saveState();
}

export async function saveState() {
    await Storage.set({
        key: STORAGE_TIMERS_KEY,
        value: JSON.stringify(timers)
    });
}

export async function loadState() {
    timers.set(JSON.parse((await Storage.get({key: STORAGE_TIMERS_KEY})).value) ?? []);
}