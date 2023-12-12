<script lang="ts">
    import { customBgUrl } from "@store/settings";

    function setBackground(event: Event): void {
        const url = (event.target as HTMLImageElement).src;
        console.log("Setting background to", url);
        customBgUrl.set(url);
    }
</script>

<style>
    ion-content {
        background-color: rgba(0,0,0,.1);
    }
    
    ion-content::part(scroll) {
        display: flex;
        padding: 0 10em;
        scroll-snap-type: x mandatory;
    }

    ion-card {
        flex: none;
        scroll-snap-align: center;
        box-shadow: .25em .25em .5em rgba(0,0,0,.5);
        margin-inline: 5px;
    }
    
    ion-card img {
        object-fit: cover;
        width: 90vw;
        height:100%;
    }
</style>

<ion-app>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-button href="/" button="true" detail="false">
                    <ion-icon name="arrow-back" />
                </ion-button>
            </ion-buttons>
            <ion-title>Backgrounds</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content scroll-x>
        <ion-card>
            <img alt="Default" src="/img/bg/bg.png" on:click={setBackground} />
        </ion-card>

        <ion-card>
            <img alt="Knot" src="/img/bg/knot/light.png" on:click={setBackground} />
        </ion-card>

        <ion-card>
            <img alt="Knot, cold" src="/img/bg/knot/cold.png" on:click={setBackground} />
        </ion-card>

        <ion-card>
            <img alt="Knot, hot" src="/img/bg/knot/hot.png" on:click={setBackground} />
        </ion-card>
    </ion-content>
</ion-app>