import { Storage } from "@capacitor/storage";
import { writable } from "svelte/store";

const STORAGE_MUTE_KEY = "mute";

// Load value from storage or use default value
let _mute = Boolean((await Storage.get({ key: STORAGE_MUTE_KEY })).value) ?? false;
// Export store to be used in the application
export const mute = writable(_mute);
// Apply change and save back to storage when the value is updated
mute.subscribe(muteValue => Storage.set({ key: STORAGE_MUTE_KEY, value: String(muteValue) }));
