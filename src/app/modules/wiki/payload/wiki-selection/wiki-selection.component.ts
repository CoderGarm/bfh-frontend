import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SubscriptionManager} from "../../../../subscription.manager";
import {Article, EnumValueDto, JWT, WikiApiService} from "../../../../services/swagger";
import EWikiCategoriesEnum = EnumValueDto.EWikiCategoriesEnum;
import GameUserRolesEnum = JWT.GameUserRolesEnum;

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

    isWikiAdmin: boolean = false;

    langCode: string = 'nope';
    possibleLanguages: string[] = [];

    constructor(private wikiService: WikiApiService) {
        super();

        this.isWikiAdmin = this.tokenStorage.getGameRoles().filter(role => role === GameUserRolesEnum.WIKI_ADMIN).length > 0;
    }

    ngOnInit(): void {
        let sub = this.wikiService.getPossibleLanguages().subscribe(resp => this.possibleLanguages = resp);
        this.subscriptions.push(sub);
        this.fetchAllArticles();
        sub = this.articleChangeReceiver.subscribe(resp => {
            this.fetchAllArticles();
            this.chose(resp);
        })
        this.subscriptions.push(sub);
    }

    private fetchAllArticles() {
        let sub = this.wikiService.getAllArticles().subscribe(resp => {
            this.articles = resp;
            this.displayArticles();
        });
        this.subscriptions.push(sub);
    }

    displayArticles() {
        const display: Map<EWikiCategoriesEnum, Article[]> = new Map<EnumValueDto.EWikiCategoriesEnum, Article[]>();
        console.log(this.langCode)
        this.articles
            .filter(a => this.langCode != 'nope' ? a.langCode === this.langCode : true)
            .forEach(a => {
                const category = a.wikiCategory;
                let arr = display.get(category);
                if (!arr) {
                    arr = [];
                }
                arr.push(a);
                display.set(category, arr);
            });
        if (!this.isWikiAdmin) {
            display.delete(EWikiCategoriesEnum.WELCOMEMESSAGE);
        }
        this.display = display;
    }

    chose(article: Article) {
        this.article = article;
        this.selectedArticleEmitter.emit(this.article);
    }

    getDisplayName(key: EWikiCategoriesEnum) {
        return key + '';
    }
}
