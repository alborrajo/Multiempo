<script lang="ts">
    import TimerList from "@components/TimerList.svelte";
    import { onMount } from "svelte";
    import { addTimer, exportRawState, importRawState, removeAllTimers } from "@store/timers";
    import { alertController } from "@ionic/core";
    import { mute } from "@store/settings";
    
    let fabAdd: HTMLIonFabElement;
    let addModal: HTMLIonModalElement;
    let addModalInput: HTMLIonInputElement;
    
    let showArchived = false;

    onMount(() => {
        addModal.initialBreakpoint = 0.25;
        addModal.breakpoints = [0, 0.25];

        document.onkeydown = fabOnKeyDown;
    });
    
    let addName='';
    
    function openAddModal() {
        addModal.present();
        setTimeout(() => addModalInput.setFocus(), 10);
    }
    
    function addTimerEventHandler(event: SubmitEvent) {
        addTimer(addName);
        addModal.dismiss();
        addName = '';
        event.preventDefault();
    }

    function fabOnKeyDown(event: KeyboardEvent) {
        if (fabAdd?.checkVisibility() && event.ctrlKey && event.key == "a") {
            openAddModal();
            event.preventDefault();
        }
    }

    async function importTimers(_event: Event) {
        // lol
        const element: HTMLInputElement = document.createElement('input');
        element.type = 'file';
        element.accept = 'application/json';
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        await new Promise(resolve => element.onchange = resolve);

        const rawState = await element.files[0].text();
        await importRawState(rawState);

        document.body.removeChild(element);
    }

    async function exportTimers(_event: Event): Promise<void> {
        const rawState = await exportRawState();

        // lmao
        const element: HTMLAnchorElement = document.createElement('a');
        element.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(rawState);
        element.download = 'state.json';
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    async function confirmRemoveAllTimers(_event: Event): Promise<void> {
        const alert = await alertController.create({
            header: "Remove all timers",
            message: 'Are you sure you want to proceed?',
            buttons: [
                {
                    text: "Cancel",
                    role: "cancel",
                },
                {
                    text: "OK",
                    role: "confirm",
                    handler: () => removeAllTimers(),
                },
            ],
        });
        await alert.present();
    }
</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<ion-app>
    <ion-header>
        <ion-toolbar class:archive-header={showArchived}>
            <ion-title>
                {#if showArchived}
                    Archived
                {:else}
                    Timers
                {/if}
            </ion-title>
            <ion-buttons slot="primary">
                <!-- Archived -->
                <ion-button on:click={_ => showArchived = !showArchived}>
                    <ion-icon slot="icon-only" name="archive" />
                </ion-button>

                <!-- Menu -->
                <ion-button id="menu-button">
                    <ion-icon slot="icon-only" name="menu" />
                </ion-button>
                <ion-popover trigger="menu-button" triggerAction="click">
                    <ng-template>
                        <ion-content>
                            <ion-list>
                                <ion-item button="true" detail="false" on:click={() => $mute = !$mute}>
                                    {#if $mute}
                                        Unmute
                                    {:else}
                                        Mute
                                    {/if}
                                </ion-item>

                                <ion-item button="true" detail="false" href="/backgrounds">Set background</ion-item>

                                <ion-item button="true" detail="false" on:click={importTimers}>Import timers</ion-item>
                                <ion-item button="true" detail="false" on:click={exportTimers}>Export timers</ion-item>

                                <ion-item button="true" detail="false" class="danger" on:click={confirmRemoveAllTimers}>Remove all timers</ion-item>
                            </ion-list>
                        </ion-content>
                    </ng-template>
                </ion-popover>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
    
    <ion-content>
        <TimerList showArchived={showArchived} />
        
        {#if !showArchived}
            <ion-fab vertical="bottom" horizontal="end" slot="fixed" title="Add new timer (Ctrl+A)" aria-keyshortcuts="Control+A" on:click={openAddModal} bind:this={fabAdd}>
                <ion-fab-button>
                    <ion-icon name="add" />
                </ion-fab-button>
            </ion-fab>
        {/if}
    </ion-content>
    
    <!-- Add modal -->
    <ion-modal bind:this="{addModal}">
        <ion-header>
            <ion-toolbar>
                <ion-title>Add Timer</ion-title>
            </ion-toolbar>
        </ion-header>
        
        <ion-content>
            <form on:submit="{addTimerEventHandler}">
                <ion-item>
                    <ion-label position="floating">Name</ion-label>
                    <ion-input bind:this="{addModalInput}" required value={addName} on:ionChange={changeEvt => addName = changeEvt.detail.value}></ion-input>
                    <ion-avatar slot="end">
                        <ion-button type="submit" color="primary" size="small" shape="round" disabled={addName==''}>
                            <ion-icon slot="icon-only" name="add"></ion-icon>
                        </ion-button>
                    </ion-avatar>
                </ion-item>
            </form>
        </ion-content>
    </ion-modal>
</ion-app>

<style>
.archive-header {
    --background: #FDC35B;
}
</style>