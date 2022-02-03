<script lang="ts">
    import type { TimerEntity } from 'src/entities/TimerEntity';
    import { createEventDispatcher, onDestroy } from 'svelte';
    import dayjs from 'dayjs'
    import duration from 'dayjs/plugin/duration';

    const dispatch = createEventDispatcher();
    
    export let timer: TimerEntity;

    let ionItemSliding: HTMLIonItemSlidingElement;
    
    let running: boolean = false;
    
    let intervalId: number;
    
    let lastTickTime: number;

    onDestroy(() => {
        stop();
    });

    function toggle() {        
        if(!running) {
            play();
        } else {
            stop();
        }
    }

    function play() {
        running = true;
        intervalId = setInterval(tick, 1000);
        lastTickTime = Date.now();
    }

    function stop() {
        running = false;
        clearInterval(intervalId);
        lastTickTime = null;
    }
    
    function tick() {
        // In case a second happens to be longer than 1 second
        // (App is suspended, for example)
        const now = Date.now();
        timer.time += (now - lastTickTime) / 1000;
        lastTickTime = now;
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
