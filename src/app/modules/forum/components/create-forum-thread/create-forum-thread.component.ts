import {Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup} from "@angular/forms";
import {CreateForumThread, Forum} from "../../../../services/swagger";
import {ForumsNotificationService} from "../../forums-notification.service";
import {SubscriptionManager} from "../../../../subscription.manager";
import {EditorInstance} from "angular-markdown-editor";
import {EditorOption} from "angular-markdown-editor/lib/angular-markdown-editor/models";
import {MarkdownService} from "ngx-markdown";
import * as DOMPurify from "dompurify";

@Component({
    selector: 'app-create-forum-thread',
    templateUrl: './create-forum-thread.component.html',
    styleUrls: ['./create-forum-thread.component.scss']
})
export class CreateForumThreadComponent extends SubscriptionManager implements OnInit {

    @Input()
    selectedForum?: Forum;

    newThreadFG: UntypedFormGroup = new UntypedFormGroup({
        newThreadsTitle: new UntypedFormControl(''),
        newThreadsDescription: new UntypedFormControl(''),
        firstMessage: new UntypedFormControl(''),
    });
    bsEditorInstance?: EditorInstance;
    editorOptions?: EditorOption;

    constructor(@Optional() @Inject('selectedForum') selectedForum: Forum | undefined,
                private markdownService: MarkdownService,
                private forumsNotificationService: ForumsNotificationService) {
        super();
        this.selectedForum = selectedForum;
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
            this.forumsNotificationService.pushCreatedThread(this.createThread());
        });
    }

    createThread(): CreateForumThread | undefined {
        let result: CreateForumThread | undefined;
        if (!!this.selectedForum) {
            result = {
                idForum: this.selectedForum.idForum,
                title: this.newThreadFG.controls.newThreadsTitle.value,
                description: this.newThreadFG.controls.newThreadsDescription.value,
                firstMessage: this.newThreadFG.controls.firstMessage.value
            };
        }
        return result;
    }
}
