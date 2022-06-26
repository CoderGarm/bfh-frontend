import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
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
export class ForumThreadsComponent extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    selectedForum?: Forum;
    selectedForumDefinition: string = 'selectedForum';

    @Input()
    isAllianceForum: boolean = false;

    @Output()
    selectedForumThreadOutput: EventEmitter<ForumThread> = new EventEmitter<ForumThread>();

    selectedForumThread?: ForumThread;
    threads?: ForumThread[];


    @ViewChild('paginatorTop')
    paginatorTop?: MatPaginator;

    @ViewChild('paginatorBottom')
    paginatorBottom?: MatPaginator;

    pageIndex: number = 0;
    pageSize: number = 5;
    threadAmount: number = 0;

    createdThread?: CreateForumThread;

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

    ngOnInit(): void {
        this.paginatorTop!.page.pipe(
            tap(() => {
                this.paginatorBottom!.pageIndex = this.paginatorTop!.pageIndex;
                this.paginatorBottom!.pageSize = this.paginatorTop!.pageSize;
            })
        ).subscribe();

        this.paginatorBottom!.page.pipe(
            tap(() => {
                this.paginatorTop!.pageIndex = this.paginatorBottom!.pageIndex;
                this.paginatorTop!.pageSize = this.paginatorBottom!.pageSize;
            })
        ).subscribe();
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
            return;
        }
        this.selectedForum = forum;
        let sub = this.forumApi.getForumThreadsByForumId(this.selectedForum.idForum).subscribe(resp => {
            this.threads = resp
            this.threadAmount = !!resp ? this.threads.length : 0;
        });
        this.subscriptions.push(sub);
    }

    selectThread(thread?: ForumThread) {
        this.selectedForumThreadOutput.emit(thread);
        this.selectedForumThread = thread;
    }


    fetchByPagination(pageEvent: PageEvent | any) {
        this.pageIndex = pageEvent.pageIndex;
        this.pageSize = pageEvent.pageSize;
    }

    createThread(thread: CreateForumThread | undefined) {
        console.log("create", thread)
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
}
