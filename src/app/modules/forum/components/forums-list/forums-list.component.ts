import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Forum, ForumApiService, ForumThread} from "../../../../services/swagger";
import {MatPaginator} from "@angular/material/paginator";
import {SubscriptionManager} from "../../../../SubscriptionManager";
import {ForumsNotificationService} from "../../forums-notification.service";

@Component({
    selector: 'app-forums-list',
    templateUrl: './forums-list.component.html',
    styleUrls: ['./forums-list.component.scss']
})
export class ForumsListComponent extends SubscriptionManager implements OnInit, OnChanges {

    static path: string = "forum";

    forums: Forum[] = [];

    @Input()
    selectedForum?: Forum;
    selectedForumDefinition: string = 'selectedForum';

    @Input()
    isAllianceForum: boolean = false;

    selectedForumThread?: ForumThread;

    @ViewChild(MatPaginator, {static: true})
    paginator?: MatPaginator;
    pageIndex: number = 0;
    pageSize: number = 5;

    constructor(private forumApi: ForumApiService, private forumsNotificationService: ForumsNotificationService) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedForumDefinition]) {
            this.selectForum(this.selectedForum);
        }
    }

    ngOnInit(): void {
        let sub = this.forumApi.getForumsForUser().subscribe(resp => this.forums = resp);
        this.subscriptions.push(sub);
    }

    selectForum(forum?: Forum) {
        if (this.isAllianceForum && !forum) {
            // ignoring the click at the main forums button in case of an alliance forum
            return;
        }
        if (!forum) {
            this.selectThread(undefined);
        }
        this.selectedForum = forum;
    }

    selectThread(thread?: ForumThread) {
        this.selectedForumThread = thread;
        if (!this.selectedForumThread) {
            this.forumsNotificationService.pushDeselectThread();
        }
    }
}
