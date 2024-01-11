import {Component, Inject, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../subscription.manager";
import {PlayerEmbassyService} from "../../../services/intercom/player-embassy.service";
import {Player, RPGTextBlocks} from "../../../services/swagger";
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {DomSanitizer} from "@angular/platform-browser";
import {EditorOption} from "angular-markdown-editor/lib/angular-markdown-editor/models";
import * as DOMPurify from "dompurify";
import {MarkdownService} from "ngx-markdown";
import {EditorInstance} from "angular-markdown-editor";
import {CdkOverlayOrigin, ConnectionPositionPair} from "@angular/cdk/overlay";

@Component({
    selector: 'app-player-embassy',
    templateUrl: './player-embassy.component.html',
    styleUrls: ['./player-embassy.component.scss']
})
export class PlayerEmbassyComponent extends SubscriptionManager implements OnInit {

    protected readonly PlayerEmbassyService = PlayerEmbassyService;

    editorOptions?: EditorOption;
    bsEditorInstance?: EditorInstance;

    position: ConnectionPositionPair[] = [
        new ConnectionPositionPair({originX: 'center', originY: 'center'}, {overlayX: 'center', overlayY: 'center'})
    ];

    width: string = '100%';
    height: string = '100%';

    triggerOrigin: any;

    player?: Player;
    isMyself: boolean = false;

    imageIsPresent: boolean = false;
    editMode: boolean = false;

    image: any;
    private readonly imageType: string = 'data:image/JPEG;base64,';

    textKeyToEdit?: string;
    text: string = '';
    textMap: Map<string, string> = new Map<string, string>();

    constructor(private sanitizer: DomSanitizer,
                private markdownService: MarkdownService,
                protected embassyService: PlayerEmbassyService,
                private dialogRef: MatDialogRef<PlayerEmbassyComponent>,
                @Inject(MAT_DIALOG_DATA) public data: MatDialogConfig) {
        super();

        this.player = <Player>data;
        this.isMyself = this.player.idUser == this.userId;
        this.fetchEmpireEmblem(this.player);
        let sub = this.dialogRef.backdropClick().subscribe(() => this.closeAndSave());
        this.subscriptions.push(sub);
        if (this.isMyself && !!this.player) {
            sub = this.embassyService.getRPGData().subscribe(resp => {
                this.player!.rolePlayData = resp;
                this.reset();
            });
            this.subscriptions.push(sub);
        }
        this.reset();
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
        this.createEditorOptions();
    }

    private createEditorOptions(keyToEdit?: string) {

        switch (keyToEdit) {
            case 'leftUpper':
                this.setSizeByTextBlock('left-upper');
                break;
            case 'rightUpper':
                this.setSizeByTextBlock('right-upper');
                break;
            case 'leftBottom':
                this.setSizeByTextBlock('left-bottom');
                break;
            case 'rightBottom':
                this.setSizeByTextBlock('left-bottom');
                break;
        }

        this.editorOptions = {
            autofocus: true,
            iconlibrary: 'fa',
            resize: "both",
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

    private setSizeByTextBlock(keyToEdit: string) {
        const elementsByClassName = document.getElementsByClassName(keyToEdit);
        if (!!elementsByClassName) {
            this.width = elementsByClassName[0].clientWidth + 'px';
            this.height = elementsByClassName[0].clientHeight + 'px';
        }
    }

    deleteEmblem() {
        let sub = this.embassyService.deleteEmpireEmblem().subscribe(resp => this.fetchEmpireEmblem(this.player));
        this.subscriptions.push(sub);
    }

    showEditButton() {
        return !this.editMode && !this.triggerOrigin;
    }

    showSaveButton(trigger: CdkOverlayOrigin) {
        const mainCondition = this.editMode;
        if (!this.triggerOrigin) {
            return mainCondition;
        }
        return mainCondition && this.triggerOrigin === trigger;
    }

    resetSingleText(keyToEdit: string) {
        const tb = this.player!.rolePlayData.textBlocks;

        const map = new Map<string, string>();
        map.set('leftUpper', !!tb.leftUpper ? tb.leftUpper : '');
        map.set('rightUpper', !!tb.rightUpper ? tb.rightUpper : '');
        map.set('leftBottom', !!tb.leftBottom ? tb.leftBottom : '');
        map.set('rightBottom', !!tb.rightBottom ? tb.rightBottom : '');

        this.textMap.set(keyToEdit, map.get(keyToEdit)!);
    }

    reset() {
        if (!this.player) {
            this.textMap.clear();
            return;
        }

        const tb = this.player!.rolePlayData.textBlocks;
        this.textMap.set('leftUpper', !!tb.leftUpper ? tb.leftUpper : '');
        this.textMap.set('rightUpper', !!tb.rightUpper ? tb.rightUpper : '');
        this.textMap.set('leftBottom', !!tb.leftBottom ? tb.leftBottom : '');
        this.textMap.set('rightBottom', !!tb.rightBottom ? tb.rightBottom : '');
    }

    closeAndSave() {

        if (!this.isMyself) {
            this.dialogRef.close();
            return;
        }

        const tb = this.player!.rolePlayData.textBlocks;
        let isEquals = this.textMap.get('leftUpper') == tb.leftUpper;
        isEquals = isEquals ? this.textMap.get('rightUpper') == tb.rightUpper : isEquals;
        isEquals = isEquals ? this.textMap.get('leftBottom') == tb.leftBottom : isEquals;
        isEquals = isEquals ? this.textMap.get('rightBottom') == tb.rightBottom : isEquals;

        if (isEquals) {
            this.dialogRef.close();
            return;
        }

        this.dialogRef.close(<RPGTextBlocks>{
            leftUpper: this.textMap.get('leftUpper'),
            rightUpper: this.textMap.get('rightUpper'),
            leftBottom: this.textMap.get('leftBottom'),
            rightBottom: this.textMap.get('rightBottom'),
        });
    }

    uploadFiles(files: File[]) {
        this.embassyService.uploadFiles(files);
        setTimeout(() => {
            this.fetchEmpireEmblem(this.player);
        }, 500);
    }

    selectForEdit(keyToEdit: string, trigger: CdkOverlayOrigin) {
        this.editMode = !this.editMode;
        const unsetTrigger = this.triggerOrigin == trigger;
        if (unsetTrigger) {
            this.triggerOrigin = undefined;
            this.textKeyToEdit = undefined;
            this.text = '';
        } else {
            this.triggerOrigin = trigger;
            this.textKeyToEdit = keyToEdit;
            this.text = this.textMap.has(this.textKeyToEdit) ? this.textMap.get(this.textKeyToEdit)! : '';
        }
        this.createEditorOptions(keyToEdit);
    }

    setText() {
        if (!!this.textKeyToEdit) {
            let text = !!this.text ? this.text : '';
            this.textMap.set(this.textKeyToEdit, text);
        }
    }
}
