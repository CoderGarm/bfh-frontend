import {Component, Inject} from '@angular/core';
import {SubscriptionManager} from "../../../subscription.manager";
import {PlayerEmbassyService} from "../../../services/intercom/player-embassy.service";
import {Player} from "../../../services/swagger";
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";

@Component({
    selector: 'app-player-embassy',
    templateUrl: './player-embassy.component.html',
    styleUrls: ['./player-embassy.component.scss']
})
export class PlayerEmbassyComponent extends SubscriptionManager {

    protected readonly PlayerEmbassyService = PlayerEmbassyService;

    player?: Player;

    constructor(protected embassyService: PlayerEmbassyService,
                private dialogRef: MatDialogRef<PlayerEmbassyComponent>,
                @Inject(MAT_DIALOG_DATA) public data: MatDialogConfig) {
        super();

        this.player = <Player>data;
    }

    close() {
        this.dialogRef.close();
    }

}
