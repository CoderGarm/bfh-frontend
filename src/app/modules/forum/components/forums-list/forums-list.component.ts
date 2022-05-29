import {Component, OnInit} from '@angular/core';
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {CreateForumThread, CreateForumThreadMessage, Forum, ForumApiService, ForumMessage, ForumThread} from "../../../../services/swagger";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
    selector: 'app-forums-list',
    templateUrl: './forums-list.component.html',
    styleUrls: ['./forums-list.component.scss']
})
export class ForumsListComponent implements OnInit {

    static path: string = "forum";


    forums: Forum[] = [];

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
    })

    constructor(private tokenStorage: TokenStorage,
                private forumApi: ForumApiService) {
    }

    ngOnInit(): void {
        this.forumApi.getForumsForUser().subscribe(resp => this.forums = resp);
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
        this.forumApi.getForumThreadsByForumId(this.selectedForum.idForum).subscribe(resp => this.threads = resp);
    }

    selectThread(thread?: ForumThread) {
        if (!thread) {
            this.selectedForumThread = undefined;
            this.messagesInThread = undefined;
            return;
        }
        this.selectedForumThread = thread;
        this.forumApi.getMessagesInThread(thread.idForumThread, 0, 5).subscribe(resp => this.messagesInThread = resp);
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
            this.forumApi.createThreadMessage(message).subscribe(resp => {
                if (resp) {
                    this.selectThread(this.selectedForumThread);
                    this.messageFG.controls.messageFC.setValue('');
                }
            });
        }
    }

    createThread() {
        if (!!this.selectedForum) {
            const thread: CreateForumThread = {
                idForum: this.selectedForum.idForum,
                title: this.newThreadFG.controls.newThreadsTitle.value,
                description: this.newThreadFG.controls.newThreadsDescription.value
            };
            this.forumApi.createForumThread(thread).subscribe(resp => {
                if (resp) {
                    this.selectForum(this.selectedForum);
                    this.newThreadFG.controls.newThreadsTitle.setValue('');
                    this.newThreadFG.controls.newThreadsDescription.setValue('');
                }
            });
        }
    }
}
