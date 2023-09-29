import {AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {CreateForumThreadMessage, EnumValueDto, ForumApiService, ForumMessage, ForumThread} from "../../../../services/swagger";
import {SubscriptionManager} from "../../../../subscription.manager";
import {tap} from "rxjs/operators";
import {DatePipe} from "@angular/common";
import {SnackbarNotificationService} from "../../../../services/snackbar-notification.service";


@Component({
    selector: 'app-forum-messages',
    templateUrl: './forum-messages.component.html',
    styleUrls: ['./forum-messages.component.scss']
})
export class ForumMessagesComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    msgToEdit?: ForumMessage;

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

    isAdmin: boolean = false;
    noSendAllowed: boolean = false;

    now: number;
    unreadMessages: number[] = [];

    constructor(private datePipe: DatePipe,
                private notif: SnackbarNotificationService,
                private forumApi: ForumApiService) {
        super();

        this.isAdmin = this.tokenStorage.getRole() === EnumValueDto.EWebUserRolesEnum.ADMIN;
        this.now = new Date().getTime();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedForumThreadDefinition]) {
            this.selectThread(this.selectedForumThread);
        }
    }

    showSendButton(message: ForumMessage) {
        if (!this.selectedForumThread || !this.selectedForumThread.title.toLowerCase().includes('release')) {
            return false;
        }
        const timeframe = new Date(Date.parse(message.sentAt + '') + (1000 * 60 * 30)).getTime();
        const indexOf = this.messagesInThread?.indexOf(message);
        return message.idForum == 1 && indexOf == 0 && this.isAdmin && this.now < timeframe;
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
        sub = this.forumApi.getUnreadMessages(thread.idForumThread).subscribe(resp => this.unreadMessages = resp);
        this.subscriptions.push(sub);
    }

    submitMessage(txt: string) {
        if (!!this.selectedForumThread) {
            if (!!this.msgToEdit) {
                let message: ForumMessage = this.msgToEdit;
                this.msgToEdit.message = txt;
                let sub = this.forumApi.editThreadMessage(message).subscribe(() => this.selectThread(this.selectedForumThread));
                this.subscriptions.push(sub);
            } else {
                let message: CreateForumThreadMessage = {
                    message: txt,
                    idForumThread: this.selectedForumThread.idForumThread
                }
                let sub = this.forumApi.createThreadMessage(message).subscribe(() => this.selectThread(this.selectedForumThread));
                this.subscriptions.push(sub);
            }
            this.msgToEdit = undefined;
        }
    }

    private markMessagesRead() {
        if (!this.messagesInThread) {
            return;
        }
        this.messagesInThread.forEach(msg =>
            this.forumApi.markForumMessageRead(msg.idForum, msg.idForumThread, msg.idForumMessage).subscribe(() => {
                setTimeout(() => {
                    const indexOf = this.unreadMessages.indexOf(msg.idForumMessage);
                    this.unreadMessages.splice(indexOf, 1);
                }, 900);
            }));
    }

    sendAsMail(message: ForumMessage) {
        this.noSendAllowed = true;
        let sub = this.forumApi.distributeRelease(message.idForumThread).subscribe(() => {
            this.notif.open("Mail sent to all receivers.");
        });
        this.subscriptions.push(sub);
    }
}
