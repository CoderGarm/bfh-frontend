import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SubscriptionManager} from "../../../../SubscriptionManager";
import {MatButtonToggleChange} from "@angular/material/button-toggle";
import {Article, WikiApiService} from "../../../../services/swagger";
import {MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent} from "@angular/material/legacy-autocomplete";

@Component({
    selector: 'app-wiki-header',
    templateUrl: './wiki-header.component.html',
    styleUrls: ['./wiki-header.component.scss']
})
export class WikiHeaderComponent extends SubscriptionManager implements OnInit {

    @Output()
    pageTypeEmitter: EventEmitter<string> = new EventEmitter();

    @Output()
    articleEmitter: EventEmitter<Article> = new EventEmitter();

    @Input()
    pageTypeReceiver: EventEmitter<string> = new EventEmitter();

    articles: Article[] = [];

    pageType: string = 'home';

    searchTerm?: string;

    @Input()
    headline?: string;

    isLoggedIn: boolean = false;

    constructor(private wikiService: WikiApiService) {
        super();
        this.isLoggedIn = !!this.tokenStorage.getUserID();
    }

    ngOnInit(): void {
        let sub = this.pageTypeReceiver.subscribe(type => this.pageType = type);
        this.subscriptions.push(sub);

    }

    setPageType(event: MatButtonToggleChange) {
        this.pageType = event.value;
        this.pageTypeEmitter.emit(this.pageType);
    }


    searchForTerm(event: string) {
        if (!!event && event.length > 0) {
            let sub = this.wikiService.getArticleForAutocomplete(event).subscribe(resp => {
                this.articles = resp
            });
            this.subscriptions.push(sub);
        }
    }

    select(event: MatAutocompleteSelectedEvent) {
        const article: Article = this.getArticle(event.option.value)!;
        this.articleEmitter.emit(article);
    }

    mapIdToTitle(id?: number) {
        return id ? this.getArticle(id)!.title : '';
    }

    private getArticle(id: number) {
        return this.articles.find(a => a.idArticle === id);
    }
}
