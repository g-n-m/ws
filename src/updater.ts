import { check } from "@tauri-apps/plugin-updater";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";

export async function checkForAppUpdates() {
    const update = await check();

    if (update?.available) {
        const wantUpdate = await ask(`
            Update to ${update.version}?
            Release notes: ${update.body}`, {
                title: "Update available",
                kind: "info",
                okLabel: "Update",
                cancelLabel: "Cancel"
            }

        )

        if (wantUpdate) {
            await update.downloadAndInstall();
            await relaunch();
        }
    }
}