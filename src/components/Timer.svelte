<script lang="ts">
    import type { TimerEntity } from "src/entities/TimerEntity";
    import { alertController, pickerController } from "@ionic/core";
    import dayjs from "dayjs";
    import duration from "dayjs/plugin/duration";
    import { addSeconds, archive, removeTimer, reset, saveState, setRunning, stop } from "@store/timers";
    import { onMount } from "svelte";
    
    export let timer: TimerEntity;

    const HOUR = 60 * 60;
    const HALF_HOUR = 30 * 60;

    const DAYJS_FORMAT_TIME = "HH:mm:ss";
    const DAYJS_FORMAT_REFERENCEDATE = "ddd, MMMM DD, YYYY";

    let popover: HTMLIonPopoverElement;
    let detailsModal: HTMLIonModalElement;

    let audioStop: HTMLAudioElement | undefined;
    let audioStart: HTMLAudioElement | undefined;
    let audio30min: HTMLAudioElement | undefined;
    let audio1hour: HTMLAudioElement | undefined;

    $: if(timer.time > 0 && Math.floor(timer.time) % HOUR == 0) {
        audio1hour?.play();
    } else if (timer.time > 0 && Math.floor(timer.time) % HALF_HOUR == 0) {
        audio30min?.play();
    }

    onMount(() => {
        audioStop = new Audio("/sfx/stop.wav");
        audioStart = new Audio("/sfx/start.wav");
        audio30min = new Audio("/sfx/30min.wav");
        audio1hour = new Audio("/sfx/1hour.wav");
    })
    
    function toggle(event: Event) {
        timer._lastTickTime = null;
        setRunning(timer, !timer._running);
        if (timer._running) {
            audioStart?.play();
        } else {
            audioStop?.play();
        }
        event.stopPropagation();
    }

    function resetEvent(_event: Event) {
        reset(timer);
        popover.isOpen = false;
    }

    function archiveEvent(_event: Event) {
        archive(timer);
        popover.isOpen = false;
        detailsModal.dismiss();
    }

    async function removeEvent(_event: Event) {
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
                        stop(timer);
                        popover.isOpen = false;
                        detailsModal.dismiss();
                        removeTimer(timer);
                    },
                },
            ],
        });
        await alert.present();
    }

    function openModal(_event: CustomEvent) {
        if(!timer.archived)
            detailsModal.present();
    }

    function closeModal(_event: Event) {
        detailsModal.dismiss();
    }

    function openPopover(event: CustomEvent) {
        popover.event = event;
        popover.isOpen = false;
        popover.isOpen = true;
        event.preventDefault();
    }

    function pickTime(_event: Event) {
        const maxHours = Math.max(100, Math.ceil(timer.time / 3600));
        const range0toHours = [...Array(maxHours).keys(),].map((n) => ({ text: n.toString(), value: n }));
        const range0to60Minutes = [...Array(60).keys()].map((n) => ({ text: n.toString(), value: n }));
        const range0to60Seconds = [...Array(60).keys()].map((n) => ({ text: n.toString(), value: n }));
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
        saveState();
    }

    function updateReferenceDate(event: Event) {
        const value = (event.currentTarget as HTMLIonInputElement).value;
        if(value === "") {
            timer.referenceDate = null;
        } else {
            timer.referenceDate = new Date(value).getTime();
        }
        saveState();
    }

    function updateReferenceEndDate(event: Event) {
        const value = (event.currentTarget as HTMLIonInputElement).value;
        if(value === "") {
            timer.referenceEndDate = null;
        } else {
            timer.referenceEndDate = new Date(value).getTime();
        }
        saveState();
    }

    function updateDescription(event: Event) {
        timer.description = (event.currentTarget as HTMLIonTextareaElement)
            .value as string;
        saveState();
    }


    function modalOnKeyUp(event: KeyboardEvent) {
        if(event.ctrlKey  && event.key == "Enter") {
            closeModal(event);
        }
    }


    dayjs.extend(duration);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
    <ion-item id="timer-list-item" on:click={openModal} on:contextmenu={openPopover}>
        <ion-avatar slot="start">
            <ion-button
                color={timer._running ? "secondary" : "primary"}
                disabled={timer.archived}
                shape="round"
                size="small"
                on:click={toggle}
            >
                <ion-icon name={timer._running ? "stop" : "play"} />
            </ion-button>
        </ion-avatar>
        <ion-label>
            <h2 class="ion-text-wrap semibold">{timer.name}</h2>
            <h4 title={timer.description}>{timer.description ?? ''}</h4>
            <ion-text class="referenceDateLine" color="medium">
                {#if  timer.referenceDate != null && timer.referenceEndDate != null}
                    <h5 class="ion-text-wrap">From <i>{dayjs(timer.referenceDate).format(DAYJS_FORMAT_REFERENCEDATE)}</i> to <i>{dayjs(timer.referenceEndDate).format(DAYJS_FORMAT_REFERENCEDATE)}</i></h5>
                {:else if timer.referenceDate != null}
                    <h5 class="ion-text-wrap"><i>{dayjs(timer.referenceDate).format(DAYJS_FORMAT_REFERENCEDATE)}</i></h5>
                {/if}
            </ion-text>
            <h2>{dayjs.duration(timer.time, "seconds").format(DAYJS_FORMAT_TIME)}</h2>
        </ion-label>

        <ion-reorder slot="end" />
    </ion-item>

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <ion-popover reference="event" bind:this={popover}>
        <ion-content>
            <ion-list class="no-padding">
                {#if !timer.archived}
                <ion-item button="true" detail="false" on:click={resetEvent}>
                    <ion-icon name="play-skip-back" />
                    Reset
                </ion-item>
                {/if}
                <ion-item button="true" detail="false" color="warning" on:click={archiveEvent}>
                    <ion-icon class="horizontal-flip" name="{timer.archived ? 'exit' : 'archive'}" />
                    {#if timer.archived}
                        Unarchive
                    {:else}
                        Archive
                    {/if}
                </ion-item>
                <ion-item button="true" detail="false" color="danger" on:click={removeEvent}>
                    <ion-icon name="trash-bin" />
                    Remove
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-popover>


    <!-- Details Modal -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <ion-modal bind:this={detailsModal} on:keyup={modalOnKeyUp}>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button title="Close timer details (Control+Enter)" aria-keyshortcuts="Control+Enter" on:click={closeModal}>
                        <ion-icon slot="icon-only" name="close" />
                    </ion-button>
                </ion-buttons>
                <ion-buttons slot="end">
                    {#if !timer.archived}
                        <ion-button on:click={resetEvent}>
                            <ion-icon slot="icon-only" name="play-skip-back" />
                        </ion-button>
                    {/if}
                    <ion-button color="warning" on:click={archiveEvent}>
                        <ion-icon slot="icon-only" class="horizontal-flip" name="{timer.archived ? 'exit' : 'archive'}" />
                    </ion-button>
                    <ion-button color="danger" on:click={removeEvent}>
                        <ion-icon slot="icon-only" name="trash-bin" />
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div class="ion-text-center fullheight xc">
                <div class="timerInfo">
                    <ion-label>
                        <h1><ion-textarea value={timer.name} on:ionChange={updateName} /></h1>
                    </ion-label>
                    <ion-text color="medium" class="referenceDates">
                    {#if timer.referenceDate != null}
                        From&nbsp;<ion-input class="referenceDateInput" type="date" value={timer.referenceDate == null ? '' : dayjs(timer.referenceDate).format("YYYY-MM-DD")} on:ionChange={updateReferenceDate}/>
                        To&nbsp;<ion-input class="referenceDateInput" type="date" value={timer.referenceEndDate == null ? '' : dayjs(timer.referenceEndDate).format("YYYY-MM-DD")} on:ionChange={updateReferenceEndDate}/>
                    {:else}
                        <ion-input class="referenceDateInput" type="date" value={timer.referenceDate == null ? '' : dayjs(timer.referenceDate).format("YYYY-MM-DD")} on:ionChange={updateReferenceDate}/>
                    {/if}
                    </ion-text>
                </div>
                <ion-item class="timerDetails">
                    <ion-textarea
                        auto-grow="true"
                        placeholder="Description"
                        value={timer.description}
                        class="ion-text"
                        on:ionChange={updateDescription}
                    />
                </ion-item>
            </div>
        </ion-content>

        <ion-footer class="ion-no-border">
            <ion-toolbar>
                <ion-title class="modal-timer ion-justify-content-center" on:click={pickTime}>
                    {dayjs
                        .duration(timer.time, "seconds")
                        .format(DAYJS_FORMAT_TIME)}
                </ion-title>

                <ion-buttons class="time-buttons ion-justify-content-center">
                    <ion-button
                        color="danger"
                        shape="round"
                        class="ion-text-capitalize"
                        on:click={() => addSeconds(timer, -60)}
                    >
                        - 1m
                    </ion-button>
                    <ion-button
                        color="danger"
                        shape="round"
                        class="ion-text-capitalize"
                        on:click={() => addSeconds(timer, -600)}
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
                        on:click={() => addSeconds(timer, 60)}
                    >
                        + 1m
                    </ion-button>
                    <ion-button
                        color="tertiary"
                        shape="round"
                        class="ion-text-capitalize"
                        on:click={() => addSeconds(timer, 600)}
                    >
                        +10m
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-footer>
    </ion-modal>

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

    .horizontal-flip {
        transform: scaleX(-1);
    }

    .no-padding {
        padding: 0;
    }

    .timerInfo {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex-grow: 1;
    }

    .referenceDateLine i {
        white-space: nowrap;
    }

    .referenceDates {
        display:grid;
        align-items: center;
        align-self: center;
        text-align: start;
        grid-template-columns: auto auto;
    }
    
    .referenceDateInput {
        height: fit-content;
        flex-grow: 0;
        width: fit-content;
        align-self: center;
        --padding-top: 5px;
        --padding-bottom: 5px;
        --padding-start: 0px;
        --padding-end: 0px;
    }

    .time-buttons {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        width: fit-content;
        margin: auto;
    }

    .modal-timer {
        width: fit-content;
        margin: auto;
    }
</style>
