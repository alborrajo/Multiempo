<script lang="ts">
    import type { TimerEntity } from "src/entities/TimerEntity";
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import { alertController, pickerController } from "@ionic/core";
    import { Platforms, isPlatform } from "@ionic/core";
    import dayjs from "dayjs";
    import duration from "dayjs/plugin/duration";

    const dispatch = createEventDispatcher();

    export let timer: TimerEntity;

    let ionItemSliding: HTMLIonItemSlidingElement;

    let detailsModal: HTMLIonModalElement;

    let intervalId: number;

    onMount(() => {
        // Don't keep counting when the app is closed on PC
        console.log();
        if (isPlatform("mobile")) {
            setRunning(timer._running);
        } else {
            setRunning(false);
        }
    });

    onDestroy(() => {
        stop();
    });

    function toggle(event: Event) {
        timer._lastTickTime = null;
        setRunning(!timer._running);
        event.stopPropagation();
    }

    function setRunning(running: boolean) {
        if (running) {
            play();
        } else {
            stop();
        }
    }

    function play() {
        timer._running = true;
        intervalId = setInterval(tick, 1000);
        tick();
    }

    function stop() {
        timer._running = false;
        clearInterval(intervalId);
    }

    function tick() {
        // In case a second happens to be longer than 1 second
        // (App is suspended, for example)
        const now = Date.now();

        if (timer._lastTickTime != null) {
            timer.time += (now - timer._lastTickTime) / 1000;
        }

        timer._lastTickTime = now;
        dispatch("tick", timer);
    }

    function addSeconds(seconds: number) {
        timer.time = Math.max(0, timer.time + seconds);
        dispatch("tick", timer);
    }

    function openMenu(event: CustomEvent) {
        ionItemSliding.open("end");
        event.preventDefault();
    }

    function reset(event: Event) {
        timer.time = 0;
        dispatch("tick", timer);
    }

    async function remove(event: Event) {
        const alert = await alertController.create({
            header: "Remove",
            message: `The timer ${timer.name} will be removed`,
            buttons: [
                {
                    text: "Cancel",
                    role: "cancel",
                },
                {
                    text: "OK",
                    role: "confirm",
                    handler: () => {
                        stop();
                        detailsModal.dismiss();
                        dispatch("remove", timer);
                    },
                },
            ],
        });
        await alert.present();
    }

    function openModal(event: CustomEvent) {
        detailsModal.present();
    }

    function pickTime(event: Event) {
        const range0toHours = [
            ...Array(Math.max(100, Math.ceil(timer.time / 3600))).keys(),
        ].map((n) => {
            return { text: n.toString(), value: n };
        });
        const range0to60Minutes = [...Array(60).keys()].map((n) => {
            return { text: n.toString(), value: n };
        });
        const range0to60Seconds = [...Array(60).keys()].map((n) => {
            return { text: n.toString(), value: n };
        });
        pickerController
            .create({
                columns: [
                    {
                        name: "hours",
                        options: range0toHours,
                        selectedIndex: Math.floor(timer.time / 3600),
                    },
                    {
                        name: "minutes",
                        options: range0to60Minutes,
                        selectedIndex: Math.floor((timer.time / 60) % 60),
                    },
                    {
                        name: "seconds",
                        options: range0to60Seconds,
                        selectedIndex: Math.floor(timer.time % 60),
                    },
                ],
                buttons: [
                    { text: "Cancel", role: "cancel" },
                    {
                        text: "Confirm",
                        handler: (selectedOption) => {
                            timer.time =
                                selectedOption.hours.value * 3600 +
                                selectedOption.minutes.value * 60 +
                                selectedOption.seconds.value;
                        },
                    },
                ],
            })
            .then((picker) => picker.present());
    }

    function updateName(event: Event) {
        timer.name = (event.currentTarget as HTMLIonInputElement)
            .value as string;
        dispatch("tick", timer);
    }

    function updateDescription(event: Event) {
        timer.description = (event.currentTarget as HTMLIonTextareaElement)
            .value as string;
        dispatch("tick", timer);
    }

    dayjs.extend(duration);
</script>

<ion-item-sliding bind:this={ionItemSliding}>
    <ion-item on:contextmenu={openMenu} on:click={openModal}>
        <ion-avatar slot="start">
            <ion-button
                color={timer._running ? "secondary" : "primary"}
                shape="round"
                size="small"
                on:click={toggle}
            >
                <ion-icon name={timer._running ? "stop" : "play"} />
            </ion-button>
        </ion-avatar>
        <ion-label>
            <h2 class="ion-text-wrap">{timer.name}</h2>
            <h3>{dayjs.duration(timer.time, "seconds").format("HH:mm:ss")}</h3>
        </ion-label>

        <ion-reorder slot="end" />
    </ion-item>

    <ion-item-options end icon-only>
        <ion-item-option on:click={reset}>
            <ion-icon name="play-skip-back" />
        </ion-item-option>
        <ion-item-option color="danger" on:click={remove}>
            <ion-icon name="trash-bin" />
        </ion-item-option>
    </ion-item-options>

    <!-- Details Modal -->
    <ion-modal bind:this={detailsModal}>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button on:click={() => detailsModal.dismiss()}>
                        <ion-icon slot="icon-only" name="close" />
                    </ion-button>
                </ion-buttons>
                <ion-title>
                    <ion-input value={timer.name} on:ionChange={updateName} />
                </ion-title>
                <ion-buttons slot="end">
                    <ion-button on:click={reset}>
                        <ion-icon slot="icon-only" name="play-skip-back" />
                    </ion-button>
                    <ion-button color="danger" on:click={remove}>
                        <ion-icon slot="icon-only" name="trash-bin" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div class="ion-text-center fullheight xc">
                <ion-label>
                    <h1 on:click={pickTime}>
                        {dayjs
                            .duration(timer.time, "seconds")
                            .format("HH:mm:ss")}
                    </h1>
                </ion-label>
                <ion-item>
                    <ion-textarea
                        auto-grow="true"
                        placeholder="Description"
                        value={timer.description}
                        class="ion-text-center"
                        on:ionChange={updateDescription}
                    />
                </ion-item>
            </div>
        </ion-content>

        <ion-footer class="ion-no-border">
            <ion-toolbar>
                <ion-buttons class="ion-justify-content-center">
                    <ion-button
                        color="danger"
                        shape="round"
                        class="ion-text-capitalize"
                        on:click={() => addSeconds(-60)}
                    >
                        - 1m
                    </ion-button>
                    <ion-button
                        color="danger"
                        shape="round"
                        class="ion-text-capitalize"
                        on:click={() => addSeconds(-600)}
                    >
                        -10m
                    </ion-button>
                    <ion-button
                        color={timer._running ? "secondary" : "primary"}
                        fill="outline"
                        shape="round"
                        size="large"
                        on:click={toggle}
                    >
                        <ion-icon name={timer._running ? "stop" : "play"} />
                    </ion-button>
                    <ion-button
                        color="tertiary"
                        shape="round"
                        class="ion-text-capitalize"
                        on:click={() => addSeconds(60)}
                    >
                        + 1m
                    </ion-button>
                    <ion-button
                        color="tertiary"
                        shape="round"
                        class="ion-text-capitalize"
                        on:click={() => addSeconds(600)}
                    >
                        +10m
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-footer>
    </ion-modal>
</ion-item-sliding>

<style>
    .fullheight {
        height: 100%;
    }

    .xc {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;
    }
</style>
