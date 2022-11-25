import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {CreateForumThread, Forum, ForumApiService, ForumThread} from "../../../../services/swagger";
import {SubscriptionManager} from "../../../../SubscriptionManager";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {ForumsNotificationService} from "../../forums-notification.service";
import {tap} from "rxjs/operators";
import {DialogData} from "../../../../components/confirmation-dialog/DialogData";
import {ConfirmDialogComponent} from "../../../../components/confirmation-dialog/confirm-dialog.component";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {CreateForumThreadComponent} from "../create-forum-thread/create-forum-thread.component";

@Component({
    selector: 'app-forum-threads',
    templateUrl: './forum-threads.component.html',
    styleUrls: ['./forum-threads.component.scss']
})
export class ForumThreadsComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    @Input()
    selectedForum?: Forum;
    selectedForumDefinition: string = 'selectedForum';

    @Input()
    isAllianceForum: boolean = false;

    @Output()
    selectedForumThreadOutput: EventEmitter<ForumThread> = new EventEmitter<ForumThread>();

    selectedForumThread?: ForumThread;
    threads?: ForumThread[];
    displayedThreads?: ForumThread[];


    @ViewChild('paginatorTop', {static: true})
    paginatorTop?: MatPaginator;

    @ViewChild('paginatorBottom', {static: true})
    paginatorBottom?: MatPaginator;

    pageIndex: number = 0;
    pageSize: number = 5;
    threadAmount: number = 0;

    createdThread?: CreateForumThread;

    unreadStateByIdForumThread: Map<number, boolean> = new Map<number, boolean>();

    constructor(private forumApi: ForumApiService,
                private forumsNotificationService: ForumsNotificationService,
                private dialog: MatDialog) {
        super();
        let sub = this.forumsNotificationService.askDeselectThread().subscribe(event => this.selectedForumThread = undefined);
        this.subscriptions.push(sub);
        sub = this.forumsNotificationService.askCreatedThread().subscribe(createdThread => this.createdThread = createdThread);
        this.subscriptions.push(sub);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedForumDefinition]) {
            this.selectForum(this.selectedForum);
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

    selectForum(forum?: Forum) {
        if (this.isAllianceForum && !forum) {
            // ignoring the click at the main forums button in case of an alliance forum
            return;
        }
        if (!forum) {
            this.selectedForum = undefined;
            this.selectedForumThreadOutput.emit(undefined);
            this.threads = undefined;
            this.detectUnreadMessages();
            return;
        }
        this.selectedForum = forum;
        let sub = this.forumApi.getForumThreadsByForumId(this.selectedForum.idForum).subscribe(resp => {
            this.threads = resp
            this.threadAmount = !!resp ? this.threads.length : 0;
            this.detectUnreadMessages();
            this.displayByPagination({
                pageIndex: this.pageIndex,
                pageSize: this.pageSize,
                previousPageIndex: 0,
                length: this.threadAmount
            });
        });
        this.subscriptions.push(sub);
    }

    selectThread(thread?: ForumThread) {
        this.selectedForumThreadOutput.emit(thread);
        this.selectedForumThread = thread;
    }


    displayByPagination(pageEvent: PageEvent) {
        if (!this.threads) {
            return;
        }
        this.pageIndex = pageEvent.pageIndex;
        this.pageSize = pageEvent.pageSize;
        const startIndex = this.pageIndex * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const topics = [];
        for (let i = startIndex; i < endIndex; i++) {
            let topic = this.threads[i];
            if (!!topic) {
                topics.push(topic);
            }
        }
        this.displayedThreads = topics;
    }

    createThread(thread: CreateForumThread | undefined) {
        if (!!thread) {
            let sub = this.forumApi.createForumThread(thread).subscribe(resp => {
                if (resp) {
                    this.selectForum(this.selectedForum);
                }
            });
            this.subscriptions.push(sub);
        }
    }

    openCreateThreadDialog() {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        let dialogData = new DialogData("New thread in " + this.selectedForum?.title);
        dialogData.addDialogDataPerTemplate(CreateForumThreadComponent,
            ['selectedForum'],
            [this.selectedForum]);
        dialogConfig.data = dialogData;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.createThread(this.createdThread);
            }
            this.createdThread = undefined;
        })
    }

    private detectUnreadMessages() {
        this.unreadStateByIdForumThread.clear();
        if (!this.threads) {
            return;
        }
        this.threads.forEach(thread => {
            const sub = this.forumApi.hasThreadUnread(thread.idForumThread).subscribe(resp => {
                this.unreadStateByIdForumThread.set(thread.idForumThread, resp);
            });
            this.subscriptions.push(sub);
        });
    }

    hasThreadUnread(thread: ForumThread) {
        let hasUnread = false;
        const knownValue = this.unreadStateByIdForumThread.get(thread.idForumThread);
        if (!!knownValue) {
            hasUnread = knownValue;
        }
        return hasUnread;
    }
}
