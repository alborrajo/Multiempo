<script lang="ts">
    import type { ItemReorderCustomEvent } from "@ionic/core";
    import { loadState, moveTimer, removeTimer, saveState, timers } from "@store/timers";
    import { onMount } from "svelte";
    import Timer from "./Timer.svelte";
    
    export let showArchived = false;

    export let list: HTMLIonListElement;

    onMount(async () => {
        await loadState();
    });
    
    function removeTimerEventHandler(event: CustomEvent) {
        removeTimer(event.detail);
    }
    
    async function doReorder(event: ItemReorderCustomEvent) {
        await moveTimer(event.detail.from, event.detail.to);
        let unsubscribe;
        unsubscribe = timers.subscribe(_ => {
            event.detail.complete();
        });
    }

    function shouldDisplay(archived: boolean, showArc: boolean): boolean {
        return showArc ? archived : !archived;
    }
</script>

<ion-list id="timer-list" bind:this={list}>
    <ion-reorder-group disabled="false" on:ionItemReorder={doReorder}>
        {#each $timers as timer}
            <div style:display="{shouldDisplay(timer.archived, showArchived) ? 'block': 'none'}">
                <Timer {timer} on:tick={saveState} on:remove={removeTimerEventHandler} />
            </div>
        {/each}
    </ion-reorder-group>
</ion-list>

<style>
    #timer-list {
        padding-bottom: 4em;
    }
</style>
