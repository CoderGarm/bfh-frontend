import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SubscriptionManager} from "../../../../subscription.manager";
import {Article, ArticleCreate, EnumValueDto, JWT, WikiApiService} from "../../../../services/swagger";
import EWikiCategoriesEnum = EnumValueDto.EWikiCategoriesEnum;
import GameUserRolesEnum = JWT.GameUserRolesEnum;
import TutorialCategoryEnum = ArticleCreate.TutorialCategoryEnum;
import ETutorialCategoriesEnum = EnumValueDto.ETutorialCategoriesEnum;

@Component({
    selector: 'app-wiki-selection',
    templateUrl: './wiki-selection.component.html',
    styleUrls: ['./wiki-selection.component.scss']
})
export class WikiSelectionComponent extends SubscriptionManager implements OnInit {

    articles: Article[] = [];

    article?: Article;

    standardArticles: Map<EWikiCategoriesEnum, Article[]> = new Map<EnumValueDto.EWikiCategoriesEnum, Article[]>();

    tutorialArticles: Map<ETutorialCategoriesEnum, Article[]> = new Map<EnumValueDto.ETutorialCategoriesEnum, Article[]>();

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
        this.setStandardArticles();

        this.setTutorials();
    }

    private setStandardArticles() {
        const display: Map<EWikiCategoriesEnum, Article[]> = new Map<EnumValueDto.EWikiCategoriesEnum, Article[]>();
        this.articles
            .filter(a => this.langCode != 'nope' ? a.langCode === this.langCode : true)
            .filter(a => !a.tutorialCategory)
            .forEach(a => {
                const category: EWikiCategoriesEnum = a.wikiCategory;
                let arr = display.get(category);
                if (!arr) {
                    arr = [];
                }
                arr.push(a);
                display.set(category, arr);
            });
        if (!this.isWikiAdmin) {
            display.delete(EWikiCategoriesEnum.WELCOME_MESSAGE);
        }
        this.standardArticles = display;
    }

    private setTutorials() {
        const tutorials: Map<TutorialCategoryEnum, Article[]> = new Map<TutorialCategoryEnum, Article[]>();
        this.articles
            .filter(a => !!a.tutorialCategory)
            .forEach(a => {
                const category: ETutorialCategoriesEnum = a.tutorialCategory!;
                let arr = tutorials.get(category);
                if (!arr) {
                    arr = [];
                }
                arr.push(a);
                tutorials.set(category, arr);
            });
        this.tutorialArticles = tutorials;
    }

    chose(article: Article) {
        this.article = article;
        this.selectedArticleEmitter.emit(this.article);
    }
}
