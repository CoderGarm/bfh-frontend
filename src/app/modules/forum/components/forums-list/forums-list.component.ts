import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {CreateForumThread, CreateForumThreadMessage, Forum, ForumApiService, ForumMessage, ForumThread} from "../../../../services/swagger";
import {FormControl, FormGroup} from "@angular/forms";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {SubscriptionManager} from "../../../../SubscriptionManager";

@Component({
    selector: 'app-forums-list',
    templateUrl: './forums-list.component.html',
    styleUrls: ['./forums-list.component.scss']
})
export class ForumsListComponent extends SubscriptionManager implements OnInit {

    static path: string = "forum";

    forums: Forum[] = [];

    @Input() // todo rework forum structure to display elements - use if in alliance
    selectedForum?: Forum;

    selectedForumThread?: ForumThread;
    threads?: ForumThread[];
    messagesInThread?: ForumMessage[];

    messageFG: FormGroup = new FormGroup({
        messageFC: new FormControl('')
    });
    newThreadFG: FormGroup = new FormGroup({
        newThreadsTitle: new FormControl(''),
        newThreadsDescription: new FormControl('')
    });

    @ViewChild(MatPaginator, {static: true})
    paginator?: MatPaginator;
    pageIndex: number = 0;
    pageSize: number = 5;
    messageAmountInThread: number = 0;

    constructor(private tokenStorage: TokenStorage,
                private forumApi: ForumApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.forumApi.getForumsForUser().subscribe(resp => this.forums = resp);
        this.subscriptions.push(sub);
    }

    selectForum(forum?: Forum) {
        if (!forum) {
            this.selectedForum = undefined;
            this.selectedForumThread = undefined;
            this.threads = undefined;
            this.messagesInThread = undefined;
            return;
        }
        this.selectedForum = forum;
        let sub = this.forumApi.getForumThreadsByForumId(this.selectedForum.idForum).subscribe(resp => this.threads = resp);
        this.subscriptions.push(sub);
    }

    selectThread(thread?: ForumThread) {
        if (!thread) {
            this.selectedForumThread = undefined;
            this.messagesInThread = undefined;
            this.messageAmountInThread = 0;
            return;
        }
        this.selectedForumThread = thread;
        let sub = this.forumApi.getMessagesInThread(thread.idForumThread, this.pageIndex, this.pageSize).subscribe(resp => this.messagesInThread = resp);
        this.subscriptions.push(sub);
        sub = this.forumApi.countMessagesInThread(thread.idForumThread).subscribe(resp => this.messageAmountInThread = resp);
    }

    fetchByPagination(pageEvent: PageEvent | any) {
        this.pageIndex = pageEvent.pageIndex;
        this.pageSize = pageEvent.pageSize;
        this.selectThread(this.selectedForumThread);
    }

    chooseStyleByChat() {
        if (!!this.messagesInThread && this.messagesInThread.length > 2) {
            return "forum-message-card set-right message-field-in-flow";
        } else {
            return "forum-message-card set-right message-field-on-hold";
        }
    }

    submitMessage() {
        if (!!this.selectedForumThread) {
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
    }

    createThread() {
        if (!!this.selectedForum) {
            const thread: CreateForumThread = {
                idForum: this.selectedForum.idForum,
                title: this.newThreadFG.controls.newThreadsTitle.value,
                description: this.newThreadFG.controls.newThreadsDescription.value
            };
            let sub = this.forumApi.createForumThread(thread).subscribe(resp => {
                if (resp) {
                    this.selectForum(this.selectedForum);
                    this.newThreadFG.controls.newThreadsTitle.setValue('');
                    this.newThreadFG.controls.newThreadsDescription.setValue('');
                }
            });
            this.subscriptions.push(sub);
        }
    }
}
