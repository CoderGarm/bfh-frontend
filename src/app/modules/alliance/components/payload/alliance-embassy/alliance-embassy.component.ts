import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {DomSanitizer} from "@angular/platform-browser";
import {EditorOption} from "angular-markdown-editor/lib/angular-markdown-editor/models";
import * as DOMPurify from "dompurify";
import {MarkdownService} from "ngx-markdown";
import {EditorInstance} from "angular-markdown-editor";
import {CdkOverlayOrigin, ConnectionPositionPair} from "@angular/cdk/overlay";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {AllianceEmbassyService} from "../../../../../services/intercom/alliance-embassy.service";
import {Alliance, JWT, RPGTextBlocks} from "../../../../../services/swagger";

@Component({
    selector: 'app-alliance-embassy',
    templateUrl: './alliance-embassy.component.html',
    styleUrls: ['./alliance-embassy.component.scss']
})
export class AllianceEmbassyComponent extends SubscriptionManager implements OnInit {

    editorOptions?: EditorOption;
    bsEditorInstance?: EditorInstance;

    position: ConnectionPositionPair[] = [
        new ConnectionPositionPair({originX: 'center', originY: 'center'}, {overlayX: 'center', overlayY: 'center'})
    ];

    width: string = '100%';
    height: string = '100%';

    triggerOrigin: any;

    alliance?: Alliance;
    isFounder: boolean = false;

    imageIsPresent: boolean = false;
    editMode: boolean = false;

    image: any;
    private readonly imageType: string = 'data:image/JPEG;base64,';

    textKeyToEdit?: string;
    text: string = '';
    textMap: Map<string, string> = new Map<string, string>();
    rolePlayData?: RPGTextBlocks;

    constructor(private sanitizer: DomSanitizer,
                private markdownService: MarkdownService,
                private embassyService: AllianceEmbassyService,
                private dialogRef: MatDialogRef<AllianceEmbassyComponent>,
                @Inject(MAT_DIALOG_DATA) public data: MatDialogConfig) {
        super();

        this.alliance = <Alliance>data;
        this.isFounder = this.alliance.idAlliance == this.userIdAlliance && this.tokenStorage.hasGameRole(JWT.GameUserRolesEnum.ALLIANCE_ADMIN);

        this.fetchAllyEmblem(this.alliance);
        let sub = this.dialogRef.backdropClick().subscribe(() => this.closeAndSave());
        this.subscriptions.push(sub);
        if (this.isFounder && !!this.alliance) {
            sub = this.embassyService.getRPGData(this.alliance.idAlliance).subscribe(resp => {
                this.rolePlayData = resp;
                this.reset();
            });
            this.subscriptions.push(sub);
        }
    }

    private fetchAllyEmblem(alliance?: Alliance) {
        if (!alliance) {
            return;
        }
        let sub = this.embassyService.getAllyEmblem(alliance?.idAlliance).subscribe(resp => {
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
        if (!this.alliance) {
            return;
        }
        let sub = this.embassyService.deleteAllyEmblem(this.alliance.idAlliance).subscribe(resp => this.fetchAllyEmblem(this.alliance));
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
        const tb = this.rolePlayData!;

        const map = new Map<string, string>();
        map.set('leftUpper', !!tb.leftUpper ? tb.leftUpper : '');
        map.set('rightUpper', !!tb.rightUpper ? tb.rightUpper : '');
        map.set('leftBottom', !!tb.leftBottom ? tb.leftBottom : '');
        map.set('rightBottom', !!tb.rightBottom ? tb.rightBottom : '');

        this.textMap.set(keyToEdit, map.get(keyToEdit)!);
    }

    reset() {
        if (!this.alliance) {
            this.textMap.clear();
            return;
        }

        const tb = this.rolePlayData!;
        this.textMap.set('leftUpper', !!tb.leftUpper ? tb.leftUpper : '');
        this.textMap.set('rightUpper', !!tb.rightUpper ? tb.rightUpper : '');
        this.textMap.set('leftBottom', !!tb.leftBottom ? tb.leftBottom : '');
        this.textMap.set('rightBottom', !!tb.rightBottom ? tb.rightBottom : '');
    }

    closeAndSave() {

        if (!this.isFounder) {
            this.dialogRef.close();
            return;
        }

        const tb = this.rolePlayData!;
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

        if (!this.alliance) {
            return;
        }

        this.embassyService.uploadFiles(this.alliance.idAlliance, files);
        setTimeout(() => {
            this.fetchAllyEmblem(this.alliance);
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
