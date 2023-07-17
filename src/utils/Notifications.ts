import { isPlatform } from '@ionic/core';
import * as tauriNotification from '@tauri-apps/api/notification';

export async function sendNotification(notification: tauriNotification.Options | string): Promise<void> {
    console.info("Sending notification", notification);
    if (isPlatform("capacitor")) {
        // Desktop, through tauri
        let permissionGranted = await  tauriNotification.isPermissionGranted();
        if (!permissionGranted) {
            const permission = await tauriNotification.requestPermission();
            permissionGranted = permission === 'granted';
        }
        if (permissionGranted) {
            tauriNotification.sendNotification(notification);
        } else {
            throw new Error("No permission granted");
        }
    } else {
        // TODO
        console.warn("TODO: Implement notifications for this platform");
    }
}