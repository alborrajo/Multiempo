<script lang="ts">
    import type { ItemReorderCustomEvent } from "@ionic/core";
    import type { TimerEntity } from "@entities/TimerEntity";
    import { loadState, removeTimer, saveState, timers } from "@store/timers";
    import { onMount } from "svelte";
    import Timer from "./Timer.svelte";
    
    export let filter: (value: TimerEntity, index?: number, array?: TimerEntity[]) => boolean;

    export let list: HTMLIonListElement;

    onMount(async () => {
        await loadState();
    });
    
    function removeTimerEventHandler(event: CustomEvent) {
        removeTimer(event.detail);
    }
    
    function doReorder(event: ItemReorderCustomEvent) {
        const movedElement = timers[event.detail.from];
        // TODO:
        //timers.splice(event.detail.from, 1);
        //timers.splice(event.detail.to, 0, movedElement);
        event.detail.complete();
        saveState();
    }
</script>

<ion-list id="timer-list" bind:this={list}>
    <ion-reorder-group disabled="false" on:ionItemReorder={doReorder}>
        {#each $timers as timer}
            <Timer {timer} on:tick={saveState} on:remove={removeTimerEventHandler} />
        {/each}
    </ion-reorder-group>
</ion-list>

<style>
    #timer-list {
        padding-bottom: 4em;
    }
</style>
