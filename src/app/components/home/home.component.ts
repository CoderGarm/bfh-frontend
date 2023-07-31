import {Component, OnInit} from '@angular/core';
import {ArticlePlainContent, WikiApiService} from "../../services/swagger";
import {SubscriptionManager} from "../../subscription.manager";
import {Route} from "@angular/router";
import {NavigationCreationService} from "../../services/navigation/navigation-creation.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent extends SubscriptionManager implements OnInit {

    static path: string = 'home';

    route: Route = NavigationCreationService.getTakeATourRoute();

    latestContent?: ArticlePlainContent;

    isOpen: boolean = false;

    constructor(private wikiService: WikiApiService) {
        super();
    }

    ngOnInit(): void {
        let sub = this.wikiService.getHomeArticle().subscribe(resp => this.latestContent = resp);
        this.subscriptions.push(sub);
    }
}
