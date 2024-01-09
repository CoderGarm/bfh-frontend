import {Component, Inject} from '@angular/core';
import {SubscriptionManager} from "../../../subscription.manager";
import {PlayerEmbassyService} from "../../../services/intercom/player-embassy.service";
import {Player} from "../../../services/swagger";
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
    selector: 'app-player-embassy',
    templateUrl: './player-embassy.component.html',
    styleUrls: ['./player-embassy.component.scss']
})
export class PlayerEmbassyComponent extends SubscriptionManager {

    protected readonly PlayerEmbassyService = PlayerEmbassyService;

    player?: Player;

    imageIsPresent: boolean = false;

    image: any;
    private readonly imageType: string = 'data:image/JPEG;base64,';

    constructor(private sanitizer: DomSanitizer,
                protected embassyService: PlayerEmbassyService,
                private dialogRef: MatDialogRef<PlayerEmbassyComponent>,
                @Inject(MAT_DIALOG_DATA) public data: MatDialogConfig) {
        super();

        this.player = <Player>data;
        let sub = this.embassyService.getEmpireEmblem().subscribe(resp => {
            this.imageIsPresent = !!resp;
            this.image = this.sanitizer.bypassSecurityTrustUrl(this.imageType + resp.content);
        });
        this.subscriptions.push(sub);
    }

    close() {
        this.dialogRef.close();
    }

    uploadFiles(files: File[]) {
        this.embassyService.uploadFiles(files);
    }
}
