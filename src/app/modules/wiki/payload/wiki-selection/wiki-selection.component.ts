import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SubscriptionManager} from "../../../../SubscriptionManager";
import {Article, EnumValueDto, WikiApiService} from "../../../../services/swagger";
import EWikiCategoriesEnum = EnumValueDto.EWikiCategoriesEnum;

@Component({
    selector: 'app-wiki-selection',
    templateUrl: './wiki-selection.component.html',
    styleUrls: ['./wiki-selection.component.scss']
})
export class WikiSelectionComponent extends SubscriptionManager implements OnInit {

    articles: Article[] = [];

    article?: Article;

    display: Map<EWikiCategoriesEnum, Article[]> = new Map<EnumValueDto.EWikiCategoriesEnum, Article[]>();

    @Output()
    selectedArticleEmitter: EventEmitter<Article> = new EventEmitter<Article>();

    @Input()
    articleChangeReceiver: EventEmitter<Article> = new EventEmitter();

    constructor(private wikiService: WikiApiService) {
        super();
    }

    ngOnInit(): void {
        this.fetchAllArticles();
        let sub = this.articleChangeReceiver.subscribe(resp => {
            this.fetchAllArticles();
            this.chose(resp);
        })
        this.subscriptions.push(sub);
    }

    private fetchAllArticles() {
        let sub = this.wikiService.getAllArticles().subscribe(resp => {
            this.articles = resp;
            const display: Map<EWikiCategoriesEnum, Article[]> = new Map<EnumValueDto.EWikiCategoriesEnum, Article[]>();
            this.articles.forEach(a => {
                const category = a.wikiCategory;
                let arr = display.get(category);
                if (!arr) {
                    arr = [];
                }
                arr.push(a);
                display.set(category, arr);
            });
            this.display = display;
        });
        this.subscriptions.push(sub);
    }


    chose(article: Article) {
        this.article = article;
        this.selectedArticleEmitter.emit(this.article);
    }

    getDisplayName(key: EWikiCategoriesEnum) {
        return key + '';
    }
}
