<script lang="ts">
    import TimerList from "@components/TimerList.svelte";
    import { onMount } from "svelte";
    import { addTimer } from "@store/timers";

    var timerList: HTMLIonListElement;
    
    let addModal: HTMLIonModalElement;
    let addModalInput: HTMLIonInputElement;
    
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

<ion-app>
    <ion-header>
        <ion-toolbar>
            <ion-title>Multiempo</ion-title>
            <ion-buttons slot="primary">
                <ion-button href="/archive">
                    <ion-icon slot="icon-only" name="archive" />
                </ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
    
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <ion-content on:click={closeListMenus}>
        <TimerList filter="{(timer => !timer.archived)}" bind:list={timerList} />
        
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <ion-fab vertical="bottom" horizontal="end" slot="fixed" on:click={openAddModal}>
            <ion-fab-button>
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

<style></style>