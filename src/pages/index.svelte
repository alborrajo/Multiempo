<script lang="ts">
    import TimerList from "@components/TimerList.svelte";
    import { onMount } from "svelte";
    import { addTimer } from "@store/timers";

    let timerList: HTMLIonListElement;
    
    let addModal: HTMLIonModalElement;
    let addModalInput: HTMLIonInputElement;
    
    let showArchived = false;

    onMount(() => {
        addModal.initialBreakpoint = 0.25;
        addModal.breakpoints = [0, 0.25];
    });
    
    let addName='';
    
    function closeListMenus(_event: Event) {
        timerList.closeSlidingItems();
    }
    
    function openAddModal() {
        addModal.present();
        addModalInput.setFocus();
    }
    
    function addTimerEventHandler(event: SubmitEvent) {
        addTimer(addName);
        addModal.dismiss();
        addName = '';
        event.preventDefault();
    }
</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<ion-app>
    <ion-header>
        <ion-toolbar class:archive-header={showArchived}>
            <ion-title>
                {#if showArchived}
                    Archivo
                {:else}
                    Tiempos
                {/if}
            </ion-title>
            <ion-buttons slot="primary">
                <ion-button on:click={_ => showArchived = !showArchived}>
                    <ion-icon slot="icon-only" name="archive" />
                </ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
    
    <ion-content on:click={closeListMenus}>
        <TimerList showArchived={showArchived} bind:list={timerList} />
        
        {#if !showArchived}
            <ion-fab vertical="bottom" horizontal="end" slot="fixed" on:click={openAddModal}>
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