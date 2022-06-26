import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from "../../../../../SubscriptionManager";
import {AllianceApiService, Forum, ForumApiService} from "../../../../../services/swagger";

@Component({
    selector: 'app-alliance-forum',
    templateUrl: './alliance-forum.component.html',
    styleUrls: ['./alliance-forum.component.scss']
})
export class AllianceForumComponent extends SubscriptionManager implements OnInit {

    forum?: Forum;

    constructor(private allianceApi: AllianceApiService,
                private forumApi: ForumApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.forumApi.getAllianceForumForUser().subscribe(resp => this.forum = resp);
        this.subscriptions.push(sub);
    }

}
