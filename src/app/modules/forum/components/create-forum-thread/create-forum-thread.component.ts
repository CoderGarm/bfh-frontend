import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CreateForumThread} from "../../../../services/swagger";
import {ForumsNotificationService} from "../../forums-notification.service";
import {SubscriptionManager} from "../../../../subscription.manager";
import {EditorInstance} from "angular-markdown-editor";
import {EditorOption} from "angular-markdown-editor/lib/angular-markdown-editor/models";
import {MarkdownService} from "ngx-markdown";
import * as DOMPurify from "dompurify";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DialogData} from "../../../../components/confirmation-dialog/DialogData";

@Component({
    selector: 'app-create-forum-thread',
    templateUrl: './create-forum-thread.component.html',
    styleUrls: ['./create-forum-thread.component.scss']
})
export class CreateForumThreadComponent extends SubscriptionManager implements OnInit {

    newThreadFG: FormGroup = new FormGroup({
        newThreadsTitle: new FormControl('', Validators.required),
        newThreadsDescription: new FormControl(''),
        firstMessage: new FormControl(''),
    });
    bsEditorInstance?: EditorInstance;
    editorOptions?: EditorOption;

    constructor(public dialogRef: MatDialogRef<CreateForumThreadComponent>,
                @Inject(MAT_DIALOG_DATA) public data: DialogData,
                private markdownService: MarkdownService,
                public forumsNotificationService: ForumsNotificationService) {
        super();
    }

    public cancel() {
        this.close(false);
    }

    public close(value: boolean) {
        this.dialogRef.close(value);
    }

    public confirm() {
        this.close(true);
    }

    @HostListener("keydown.esc")
    public onEsc() {
        this.close(false);
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

        this.newThreadFG.valueChanges.subscribe(value => {
            if (this.newThreadFG.valid) {
                this.forumsNotificationService.pushCreatedThread(this.createThread());
            }
        });
    }

    createThread(): CreateForumThread | undefined {
        let result: CreateForumThread | undefined;
        if (!!this.forumsNotificationService.selectedForum) {
            result = {
                idForum: this.forumsNotificationService.selectedForum.idForum,
                title: this.newThreadFG.controls.newThreadsTitle.value,
                description: this.newThreadFG.controls.newThreadsDescription.value,
                firstMessage: this.newThreadFG.controls.firstMessage.value
            };
        }
        return result;
    }
}
