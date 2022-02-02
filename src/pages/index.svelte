<script lang="ts">
    import type { TimerEntity } from "@entities/TimerEntity";
    import Timer from "@components/Timer.svelte";
    import { onMount } from "svelte";

    const STORAGE_TIMERS_KEY = "timers";

    let timerList: HTMLIonListElement;

    let addModal: HTMLIonModalElement;
    let addModalInput: HTMLIonInputElement;

    onMount(async () => {
        addModal.initialBreakpoint = 0.25;
        addModal.breakpoints = [0, 0.25];
    });

    let timers: Array<TimerEntity>;

    let addName='';

    function openAddModal() {
        addModal.present();
        addModalInput.setFocus();
    }

    function addTimer(event: SubmitEvent) {
        console.log("New timer", addName);
        timers = [...timers, {name: addName, time: 0}];
        addModal.dismiss();
        addName = '';
        saveState();
        event.preventDefault();
    }

    function removeTimer(event: CustomEvent) {
        console.log(event.detail);
        timers = timers.filter(timer => timer != event.detail);
        saveState();
    }

    function saveState() {
        localStorage.setItem(STORAGE_TIMERS_KEY, JSON.stringify(timers));
    }

    function loadState() {
        timers = JSON.parse(localStorage.getItem(STORAGE_TIMERS_KEY));
        if(timers == null) {
            timers = [];
        }
    }

    function closeListMenus(event: Event) {
        timerList.closeSlidingItems();
    }

    loadState();
</script>

<ion-app>
    <ion-header>
        <ion-toolbar>
            <ion-title>Multiempo</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content on:click="{closeListMenus}">
        <ion-list bind:this="{timerList}">
            <ion-reorder-group disabled="true">
                {#each timers as timer}
                    <Timer {timer} on:tick={saveState} on:remove={removeTimer}/>
                {/each}
            </ion-reorder-group>
        </ion-list>

        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
            <ion-fab-button on:click={openAddModal}>
                <ion-icon name="add" />
            </ion-fab-button>
        </ion-fab>
    </ion-content>

    <!-- Add modal -->
    <ion-modal bind:this="{addModal}">
        <ion-header>
            <ion-toolbar>
                <ion-title>Add Timer</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <form on:submit="{addTimer}">
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
</style>
