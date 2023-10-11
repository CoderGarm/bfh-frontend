import {AfterViewInit, Component, HostListener, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {CreateForumThreadMessage, EnumValueDto, ForumApiService, ForumMessage, ForumThread} from "../../../../services/swagger";
import {SubscriptionManager} from "../../../../subscription.manager";
import {tap} from "rxjs/operators";
import {DatePipe} from "@angular/common";
import {SnackbarNotificationService} from "../../../../services/snackbar-notification.service";
import {timer} from "rxjs";


@Component({
    selector: 'app-forum-messages',
    templateUrl: './forum-messages.component.html',
    styleUrls: ['./forum-messages.component.scss']
})
export class ForumMessagesComponent extends SubscriptionManager implements AfterViewInit, OnChanges, OnDestroy {

    msgToEdit?: ForumMessage;

    @Input()
    selectedForumThread?: ForumThread;
    selectedForumThreadDefinition: string = 'selectedForumThread';

    messagesInThread?: ForumMessage[];
    markAsRead: number[] = [];

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

        let sub = timer(0, 3 * 60 * 1000).subscribe(() => this.markMessagesRead());
        this.subscriptions.push(sub);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedForumThreadDefinition]) {
            this.selectThread(this.selectedForumThread);
        }
    }

    ngOnDestroy() {
        this.markMessagesRead();
        super.ngOnDestroy();
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

    @HostListener('document:scroll', ['$event'])
    @HostListener('window:wheel', ['$event'])
    @HostListener('window:touchmove', ['$event'])
    public onViewportScroll() {
        this.markMessagesInViewportAsRead();
    }

    private markMessagesInViewportAsRead() {
        const inViewPortObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                let target = entry.target;
                if (entry.isIntersecting) {
                    target.classList.forEach(cssClass => {
                        if (cssClass.startsWith('messageId-')) {
                            const idForumMessage = Number.parseInt(cssClass.split('-')[1]);
                            if (!this.markAsRead.includes(idForumMessage)) {
                                this.markAsRead.push(idForumMessage);
                            }
                        }
                    });
                }
            });
        });

        const svg = document.querySelectorAll(".forum-card");
        svg.forEach(card => inViewPortObserver.observe(card));
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
        let sub = this.forumApi.getMessagesInThread(thread.idForumThread, this.pageIndex, this.pageSize)
            .subscribe(resp => {
                this.messagesInThread = resp;
                for (let i = 0; i < (resp.length >= 3 ? 3 : resp.length); i++) {
                    // just add the first three to mark as read
                    this.markAsRead.push(resp[i].idForumMessage);
                }
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
        if (this.markAsRead.length == 0) {
            return;
        }

        const toMarkAsRead = this.markAsRead.filter(idForumMessage => this.unreadMessages.includes(idForumMessage));
        toMarkAsRead.forEach(idForumMessage =>
            this.forumApi.markForumMessageRead({idMessage: idForumMessage}).subscribe(() => {
                const indexOf = this.markAsRead.indexOf(idForumMessage);
                this.markAsRead.splice(indexOf, 1);
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
