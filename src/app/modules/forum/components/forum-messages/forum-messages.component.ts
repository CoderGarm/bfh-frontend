import {AfterViewInit, Component, HostListener, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {CreateForumThreadMessage, EnumValueDto, ForumApiService, ForumMessage, ForumThread} from "../../../../services/swagger";
import {SubscriptionManager} from "../../../../subscription.manager";
import {tap} from "rxjs/operators";
import {SnackbarNotificationService} from "../../../../services/snackbar-notification.service";
import {ForumsCommunicationService} from "../../forums-communication.service";


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

    constructor(private notif: SnackbarNotificationService,
                protected forumsCommService: ForumsCommunicationService,
                private forumService: ForumApiService) {
        super();

        this.isAdmin = this.tokenStorage.getRole() === EnumValueDto.EWebUserRolesEnum.ADMIN;
        this.now = new Date().getTime();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedForumThreadDefinition]) {
            this.selectThread(this.selectedForumThread);
        }
    }

    ngOnDestroy() {
        this.forumsCommService.markMessagesRead();
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
                            if (!this.forumsCommService.markAsRead.includes(idForumMessage)) {
                                this.markMessageRead(idForumMessage);
                            }
                        }
                    });
                }
            });
        });

        const svg = document.querySelectorAll(".forum-card");
        svg.forEach(card => inViewPortObserver.observe(card));
    }

    private markMessageRead(idForumMessage: number) {
        this.forumsCommService.markAsRead.push(idForumMessage);
        this.forumsCommService.markMessagesRead();
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
            this.forumsCommService.unreadMessages = [];
            return;
        }
        this.selectedForumThread = thread;
        let sub = this.forumService.getMessagesInThread(thread.idForumThread, this.pageIndex, this.pageSize)
            .subscribe(resp => {
                this.messagesInThread = resp.messages;
                this.pageIndex = resp.page;
            });
        this.subscriptions.push(sub);
        sub = this.forumService.countMessagesInThread(thread.idForumThread).subscribe(resp => this.messageAmountInThread = !!resp ? resp : 0);
        this.subscriptions.push(sub);
        sub = this.forumService.getUnreadMessages(thread.idForumThread).subscribe(resp => this.forumsCommService.unreadMessages = resp);
        this.subscriptions.push(sub);
    }

    submitMessage(txt: string) {
        if (!!this.selectedForumThread) {
            if (!!this.msgToEdit) {
                let message: ForumMessage = this.msgToEdit;
                this.msgToEdit.message = txt;
                let sub = this.forumService.editThreadMessage(message).subscribe(() => this.selectThread(this.selectedForumThread));
                this.subscriptions.push(sub);
            } else {
                let message: CreateForumThreadMessage = {
                    message: txt,
                    idForumThread: this.selectedForumThread.idForumThread
                }
                let sub = this.forumService.createThreadMessage(message).subscribe(resp => {
                    this.selectThread(this.selectedForumThread);
                    this.forumsCommService.unreadMessages.push(resp.idForumMessage);
                    this.markMessageRead(resp.idForumMessage);
                });
                this.subscriptions.push(sub);
            }
            this.msgToEdit = undefined;
        }
    }

    sendAsMail(message: ForumMessage) {
        this.noSendAllowed = true;
        let sub = this.forumService.distributeRelease(message.idForumThread).subscribe(() => {
            this.notif.open("Mail sent to all receivers.");
        });
        this.subscriptions.push(sub);
    }
}
