import { writable } from "svelte/store";
import { Storage } from "@capacitor/storage";
import type { TimerEntity } from "@entities/TimerEntity";
import { isPlatform } from "@ionic/core";

const STORAGE_TIMERS_KEY = "timers";

let _timers = [] as TimerEntity[];
export const timers = writable(_timers);

let _intervalIds = new Map<TimerEntity, number>();

loadState();

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
    const movedElement = _timers[from];
    _timers.splice(from, 1);
    _timers.splice(to, 0, movedElement);
    _timers = _timers;
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
    for (const timer of _timers) {
        // Don't keep counting when the app is closed on PC
        if (isPlatform("mobile")) {
            setRunning(timer, timer._running);
        } else {
            setRunning(timer, false);
        }
    }
    timers.set(_timers);
}


export function setRunning(timer: TimerEntity, running: boolean) {
    if (running) {
        play(timer);
    } else {
        stop(timer);
    }
}

export function play(timer: TimerEntity) {
    timer._running = true;
    timer._lastTickTime = Date.now();
    _intervalIds.set(timer, setInterval(() => tick(timer), 1000));
    tick(timer);
}

export function stop(timer: TimerEntity) {
    timer._running = false;
    clearInterval(_intervalIds.get(timer));
    tick(timer);
}

export function tick(timer: TimerEntity) {
    // In case a second happens to be longer than 1 second
    // (App is suspended, for example)
    const now = Date.now();

    if (timer._running && timer._lastTickTime != null) {
        timer.time += (now - timer._lastTickTime) / 1000;
    }

    timer._lastTickTime = now;
    saveState();
}

export function addSeconds(timer: TimerEntity, seconds: number) {
    timer.time = Math.max(0, timer.time + seconds);
}

export function reset(timer: TimerEntity) {
    timer.time = 0;
    tick(timer);
}

export function archive(timer: TimerEntity) {
    timer.archived = !timer.archived
    if(timer.archived) {
        stop(timer);
    }
    tick(timer);
}