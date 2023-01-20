import {AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {LegacyPageEvent as PageEvent, MatLegacyPaginator as MatPaginator} from "@angular/material/legacy-paginator";
import {CreateForumThreadMessage, ForumApiService, ForumMessage, ForumThread} from "../../../../services/swagger";
import {SubscriptionManager} from "../../../../SubscriptionManager";
import {tap} from "rxjs/operators";
import {MarkdownService} from "ngx-markdown";
import {EditorInstance} from "angular-markdown-editor";
import {EditorOption} from "angular-markdown-editor/lib/angular-markdown-editor/models";


@Component({
    selector: 'app-forum-messages',
    templateUrl: './forum-messages.component.html',
    styleUrls: ['./forum-messages.component.scss']
})
export class ForumMessagesComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    private isEditMode?: ForumMessage;

    @Input()
    selectedForumThread?: ForumThread;
    selectedForumThreadDefinition: string = 'selectedForumThread';

    messagesInThread?: ForumMessage[];

    @ViewChild('paginatorTop', {static: true})
    paginatorTop?: MatPaginator;

    @ViewChild('paginatorBottom', {static: true})
    paginatorBottom?: MatPaginator;

    pageIndex: number = 0;
    pageSize: number = 15;
    messageAmountInThread: number = 0;

    bsEditorInstance?: EditorInstance;
    editorOptions?: EditorOption;

    markdownText: string = '';

    constructor(private markdownService: MarkdownService,
                private forumApi: ForumApiService) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedForumThreadDefinition]) {
            this.selectThread(this.selectedForumThread);
        }
    }

    ngAfterViewInit(): void {

        this.editorOptions = {
            iconlibrary: 'fa',
            fullscreen: {
                enable: false,
                icons: {}
            },
            parser: (val) => this.markdownService.compile(val.trim()),
            onChange: () => {
            },
            onShow: (e) => this.bsEditorInstance = e
        };

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
    }

    submitMessage() {
        if (!!this.selectedForumThread) {
            if (this.isEditMode) {
                let message: ForumMessage = this.isEditMode;
                this.isEditMode.message = this.markdownText;
                let sub = this.forumApi.editThreadMessage(message).subscribe(resp => {
                    if (resp) {
                        this.selectThread(this.selectedForumThread);
                        this.markdownText = '';
                    }
                });
                this.subscriptions.push(sub);
            } else {
                let message: CreateForumThreadMessage = {
                    message: this.markdownText,
                    idForumThread: this.selectedForumThread.idForumThread
                }
                let sub = this.forumApi.createThreadMessage(message).subscribe(resp => {
                    if (resp) {
                        this.selectThread(this.selectedForumThread);
                        this.markdownText = '';
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
        this.markdownText = message.message;
    }
}
