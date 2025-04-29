import { Preferences } from "@capacitor/preferences";
import { writable } from "svelte/store";

const STORAGE_MUTE_KEY = "mute";
const STORAGE_BGURL_KEY = "customBgImage";

let settingsLoaded = false;

// Load value from storage or use default value
let _mute = false;
// Export store to be used in the application
export const mute = writable(_mute);
// Apply change and save back to storage when the value is updated
mute.subscribe(muteValue => {
    if(settingsLoaded) {
        Preferences.set({ key: STORAGE_MUTE_KEY, value: String(muteValue) })
    }
});

// Load value from storage or use default value
let _customBgUrl: string = '/img/bg/bg.png';
// Export store to be used in the application
export const customBgUrl = writable(_customBgUrl);
// Apply change and save back to storage when the value is updated
customBgUrl.subscribe(customBgUrlValue => {
    document.documentElement.style.setProperty('--multiempo-background-image-url', `url(${customBgUrlValue})`)
    if(settingsLoaded) {
        Preferences.set({ key: STORAGE_BGURL_KEY, value: customBgUrlValue });
    }
});


// Load settings from storage
const muteLoaded = Preferences.get({ key: STORAGE_MUTE_KEY }).then(result => {
    if (result.value != null) {
        mute.set(result.value === "true");
    }
});

const bgUrlLoaded = Preferences.get({ key: STORAGE_BGURL_KEY }).then(result => {
    if (result.value != null) {
        customBgUrl.set(result.value);
    }
});

Promise.all([muteLoaded, bgUrlLoaded]).then(_ => settingsLoaded = true);

