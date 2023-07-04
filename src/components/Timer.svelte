<script lang="ts">
    import type { TimerEntity } from "src/entities/TimerEntity";
    import { alertController, pickerController } from "@ionic/core";
    import dayjs from "dayjs";
    import duration from "dayjs/plugin/duration";
    import { addSeconds, archive, removeTimer, reset, saveState, setRunning, stop } from "@store/timers";
    
    export let timer: TimerEntity;
    
    const DAYJS_FORMAT_TIME = "HH:mm:ss";
    const DAYJS_FORMAT_REFERENCEDATE = "dddd, MMMM DD, YYYY";

    let popover: HTMLIonPopoverElement;
    let detailsModal: HTMLIonModalElement;
    
    function toggle(event: Event) {
        timer._lastTickTime = null;
        setRunning(timer, !timer._running);
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
        timer.referenceDate = new Date((event.currentTarget as HTMLIonInputElement).value).getTime();
        saveState();
    }

    function updateDescription(event: Event) {
        timer.description = (event.currentTarget as HTMLIonTextareaElement)
            .value as string;
        saveState();
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
            <h2 class="ion-text-wrap">{timer.name}</h2>
            <h4 title={timer.description}>{timer.description ?? ''}</h4>
            {#if  timer.referenceDate != null}
                <h5 class="ion-text-wrap">{dayjs(timer.referenceDate).format(DAYJS_FORMAT_REFERENCEDATE)}</h5>
            {/if}
            <h3>{dayjs.duration(timer.time, "seconds").format(DAYJS_FORMAT_TIME)}</h3>
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
                <ion-label>
                    <h1 on:click={pickTime}>
                        {dayjs
                            .duration(timer.time, "seconds")
                            .format(DAYJS_FORMAT_TIME)}
                    </h1>
                </ion-label>
                <ion-input id="referenceDateInput" type="date" value={timer.referenceDate == null ? '' : dayjs(timer.referenceDate).format("YYYY-MM-DD")} on:ionChange={updateReferenceDate}/>
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

    #referenceDateInput {
        height: fit-content;
        flex-grow: 0;
        width: fit-content;
        align-self: center;
    }
</style>
