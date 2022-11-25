import {AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {CreateForumThreadMessage, ForumApiService, ForumMessage, ForumThread} from "../../../../services/swagger";
import {FormControl, FormGroup} from "@angular/forms";
import {SubscriptionManager} from "../../../../SubscriptionManager";
import {ForumsNotificationService} from "../../forums-notification.service";
import {tap} from "rxjs/operators";
import {AngularEditorConfig} from "@kolkov/angular-editor";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";


@Component({
    selector: 'app-forum-messages',
    templateUrl: './forum-messages.component.html',
    styleUrls: ['./forum-messages.component.scss']
})
export class ForumMessagesComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    /**
     * the logged-in user
     */
    userID?: number;

    private isEditMode?: ForumMessage;

    @Input()
    selectedForumThread?: ForumThread;
    selectedForumThreadDefinition: string = 'selectedForumThread';

    messagesInThread?: ForumMessage[];

    messageFG: FormGroup = new FormGroup({
        messageFC: new FormControl('')
    });

    @ViewChild('paginatorTop', {static: true})
    paginatorTop?: MatPaginator;

    @ViewChild('paginatorBottom', {static: true})
    paginatorBottom?: MatPaginator;

    pageIndex: number = 0;
    pageSize: number = 15;
    messageAmountInThread: number = 0;
    private readonly writeYourMessage = 'Write your message...';
    editorConfig: AngularEditorConfig = {
        editable: false,
        placeholder: this.writeYourMessage,
        showToolbar: false,
        enableToolbar: false,
        sanitize: true
    };

    constructor(private tokenStorage: TokenStorage,
                private forumApi: ForumApiService,
                private forumsNotificationService: ForumsNotificationService) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedForumThreadDefinition]) {
            this.selectThread(this.selectedForumThread);
        }
    }

    ngAfterViewInit(): void {
        if (!!this.paginatorTop && !!this.paginatorBottom) {
            this.paginatorTop.page.pipe(
                tap(() => {
                    this.paginatorBottom!.pageIndex = this.paginatorTop!.pageIndex;
                    this.paginatorBottom!.pageSize = this.paginatorTop!.pageSize;
                })
            ).subscribe();

            this.paginatorBottom.page.pipe(
                tap(() => {
                    this.paginatorTop!.pageIndex = this.paginatorBottom!.pageIndex;
                    this.paginatorTop!.pageSize = this.paginatorBottom!.pageSize;
                })
            ).subscribe();
        }
    }

    fetchByPagination(pageEvent: PageEvent | any) {
        this.pageIndex = pageEvent.pageIndex;
        this.pageSize = pageEvent.pageSize;
        this.selectThread(this.selectedForumThread);
    }

    selectThread(thread?: ForumThread) {
        if (!thread) {
            this.selectedForumThread = undefined;
            this.messagesInThread = undefined;
            this.messageAmountInThread = 0;
            this.editorConfig.editable = false;
            this.editorConfig.placeholder = this.writeYourMessage;
            return;
        }
        this.selectedForumThread = thread;
        let sub = this.forumApi.getMessagesInThread(thread.idForumThread, this.pageIndex, this.pageSize).subscribe(resp => {
            this.messagesInThread = resp;
            this.markMessagesRead();
        });
        this.subscriptions.push(sub);
        sub = this.forumApi.countMessagesInThread(thread.idForumThread).subscribe(resp => this.messageAmountInThread = !!resp ? resp : 0);
        this.subscriptions.push(sub);
        this.editorConfig.editable = true;
        this.editorConfig.placeholder = this.getPlaceholder(thread);
    }

    private getPlaceholder(thread: ForumThread) {
        return this.writeYourMessage + ' to ' + thread.title;
    }

    submitMessage() {
        if (!!this.selectedForumThread) {
            if (this.isEditMode) {
                let message: ForumMessage = this.isEditMode;
                this.isEditMode.message = this.messageFG.controls.messageFC.value;
                let sub = this.forumApi.editThreadMessage(message).subscribe(resp => {
                    if (resp) {
                        this.selectThread(this.selectedForumThread);
                        this.messageFG.controls.messageFC.setValue('');
                    }
                });
                this.subscriptions.push(sub);
            } else {
                let message: CreateForumThreadMessage = {
                    message: this.messageFG.controls.messageFC.value,
                    idForumThread: this.selectedForumThread.idForumThread
                }
                let sub = this.forumApi.createThreadMessage(message).subscribe(resp => {
                    if (resp) {
                        this.selectThread(this.selectedForumThread);
                        this.messageFG.controls.messageFC.setValue('');
                    }
                });
                this.subscriptions.push(sub);
            }
            this.isEditMode = undefined;
        }
    }

    private markMessagesRead() {
        if (!this.messagesInThread) {
            return;
        }
        this.messagesInThread.forEach(msg =>
            this.forumApi.markForumMessageRead(msg.idForum, msg.idForumThread, msg.idForumMessage).subscribe(() => {
            })
        );
    }

    edit(message: ForumMessage) {
        this.isEditMode = message;
        this.messageFG.controls.messageFC.setValue(message.message);
    }
}
