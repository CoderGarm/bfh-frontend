import {Component, Inject, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../subscription.manager";
import {PlayerEmbassyService} from "../../../services/intercom/player-embassy.service";
import {Player} from "../../../services/swagger";
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {DomSanitizer} from "@angular/platform-browser";
import {EditorOption} from "angular-markdown-editor/lib/angular-markdown-editor/models";
import * as DOMPurify from "dompurify";
import {MarkdownService} from "ngx-markdown";
import {EditorInstance} from "angular-markdown-editor";
import {CdkOverlayOrigin} from "@angular/cdk/overlay";

@Component({
    selector: 'app-player-embassy',
    templateUrl: './player-embassy.component.html',
    styleUrls: ['./player-embassy.component.scss']
})
export class PlayerEmbassyComponent extends SubscriptionManager implements OnInit {

    protected readonly PlayerEmbassyService = PlayerEmbassyService;

    editorOptions?: EditorOption;
    bsEditorInstance?: EditorInstance;

    triggerOrigin: any;

    player?: Player;
    isMyself: boolean = false;

    imageIsPresent: boolean = false;
    editMode: boolean = false;

    image: any;
    private readonly imageType: string = 'data:image/JPEG;base64,';

    text: string = '';
    leftUpper: string = '';
    rightUpper: string = '';

    constructor(private sanitizer: DomSanitizer,
                private markdownService: MarkdownService,
                protected embassyService: PlayerEmbassyService,
                private dialogRef: MatDialogRef<PlayerEmbassyComponent>,
                @Inject(MAT_DIALOG_DATA) public data: MatDialogConfig) {
        super();

        this.player = <Player>data;
        this.isMyself = this.player.idUser == this.userId;
        this.fetchEmpireEmblem(this.player);
    }

    private fetchEmpireEmblem(player?: Player) {
        if (!player) {
            return;
        }
        let sub = this.embassyService.getEmpireEmblem(player.idUser).subscribe(resp => {
            this.imageIsPresent = !!resp;
            if (this.imageIsPresent) {
                this.image = this.sanitizer.bypassSecurityTrustUrl(this.imageType + resp.content);
            } else {
                this.image = undefined;
            }
        });
        this.subscriptions.push(sub);
    }

    ngOnInit(): void {
        this.editorOptions = {
            iconlibrary: 'fa',
            fullscreen: {
                enable: false,
                icons: {}
            },
            parser: (val) => {
                const sanitizedText = DOMPurify.sanitize(val.trim());
                this.markdownService.parse(sanitizedText);
            },
            onChange: () => {
            },
            onShow: (e) => this.bsEditorInstance = e
        };
    }

    deleteEmblem() {
        let sub = this.embassyService.deleteEmpireEmblem().subscribe(resp => this.fetchEmpireEmblem(this.player));
        this.subscriptions.push(sub);
    }

    close() {
        this.dialogRef.close();
    }

    uploadFiles(files: File[]) {
        this.embassyService.uploadFiles(files);
        setTimeout(() => {
            this.fetchEmpireEmblem(this.player);
        }, 500);
    }

    selectForEdit(toEdit: string, trigger: CdkOverlayOrigin) {
        // fixme edit different texts
        this.text = toEdit;
        this.triggerOrigin = trigger;
    }
}
