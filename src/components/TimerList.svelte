<script lang="ts">
    import type { ItemReorderCustomEvent } from "@ionic/core";
    import { archive, moveTimer, timers } from "@store/timers";
    import Timer from "./Timer.svelte";
    
    export let showArchived = false;

    export let list: HTMLIonListElement;
    
    async function doReorder(event: ItemReorderCustomEvent) {
        await moveTimer(event.detail.from, event.detail.to);
        event.detail.complete(false);
    }

    function shouldDisplay(archived: boolean, showArc: boolean): boolean {
        return showArc ? archived : !archived;
    }
</script>

<ion-list id="timer-list" bind:this={list}>
    <ion-reorder-group disabled="false" on:ionItemReorder={doReorder}>
        {#each $timers as timer}
            <div style:display={shouldDisplay(timer.archived, showArchived) ? 'block' : 'none'} >
                <Timer {timer} />
            </div>
        {/each}
    </ion-reorder-group>
</ion-list>

<style>
    #timer-list {
        padding-bottom: 4em;
    }
</style>
