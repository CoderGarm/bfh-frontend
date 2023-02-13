import {Component, OnInit} from '@angular/core';
import {ArticlePlainContent, WikiApiService} from "../../services/swagger";
import {SubscriptionManager} from "../../subscription.manager";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent extends SubscriptionManager implements OnInit {

    static path: string = 'home';

    latestContent?: ArticlePlainContent;

    constructor(private wikiService: WikiApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.wikiService.getHomeArticle().subscribe(resp => this.latestContent = resp);
        this.subscriptions.push(sub);
    }

}
