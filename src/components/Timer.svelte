<script lang="ts">
    import * as dayjs from 'dayjs'
    import duration from 'dayjs/plugin/duration';
    import type { TimerEntity } from 'src/entities/TimerEntity';
    import { createEventDispatcher, onDestroy } from 'svelte';

    const dispatch = createEventDispatcher();
    
    export let timer: TimerEntity;

    let ionItemSliding: HTMLIonItemSlidingElement;
    
    let running: boolean = false;
    
    let intervalId: number;
    
    function toggle() {
        running = !running;
        
        if(running) {
            play();
        } else {
            stop();
        }
    }

    function play() {
        intervalId = setInterval(tick, 1000);
    }

    function stop() {
        clearInterval(intervalId);
    }
    
    function tick() {
        timer.time++;
        dispatch('tick', timer);
    }

    function openMenu(event: CustomEvent) {
        ionItemSliding.open('end');
        event.preventDefault();
    }

    function remove() {
        stop();
        dispatch('remove', timer);
    }

    onDestroy(stop);

    dayjs.extend(duration);
</script>

<ion-item-sliding bind:this="{ionItemSliding}">
    <ion-item on:contextmenu="{openMenu}">
        <ion-avatar slot="start">
            <ion-button color="{running ? 'secondary' : 'primary'}" shape="round" size="small" on:click={toggle}>
                <ion-icon name="{running ? 'stop' : 'play'}" />
            </ion-button>
        </ion-avatar>
        <ion-label>
            <h2 class="ion-text-wrap">{ timer.name }</h2>
            <h3>{ dayjs.duration(timer.time, 'seconds').format('HH:mm:ss') }</h3>
        </ion-label>

        <ion-reorder slot="end"></ion-reorder>
    </ion-item>

    <ion-item-options end icon-only >
        <ion-item-option color="danger" on:click={remove}>
            <ion-icon name="trash-bin" />
        </ion-item-option>
    </ion-item-options>
</ion-item-sliding>

<style></style>
