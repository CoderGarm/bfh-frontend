import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Article, ArticleCreate, ArticleEdit, ArticlePlainContent, UserApiService, UserJson, WikiApiService} from "../../../../services/swagger";
import {SubscriptionManager} from "../../../../SubscriptionManager";

@Component({
    selector: 'app-wiki-main',
    templateUrl: './wiki-main.component.html',
    styleUrls: ['./wiki-main.component.scss']
})
export class WikiMainComponent extends SubscriptionManager implements OnInit {

    static path: string = 'wiki';

    article?: Article;
    author?: UserJson;
    latestContent?: ArticlePlainContent;

    @Output()
    pageTypeEmitter: EventEmitter<string> = new EventEmitter();
    pageType: string = 'home';

    @Output()
    articleChangeEmitter: EventEmitter<Article> = new EventEmitter();

    isLoggedIn: boolean = false;

    constructor(private wikiService: WikiApiService,
                private userService: UserApiService) {
        super();
        this.isLoggedIn = !!this.tokenStorage.getUserID();
    }

    ngOnInit(): void {
    }

    createArticle(event: ArticleCreate) {
        let sub = this.wikiService.createArticle(event).subscribe(resp => this.articleChangeEmitter.emit(resp));
        this.subscriptions.push(sub);
    }

    editArticle(event: ArticleEdit) {
        let sub = this.wikiService.editArticle(event).subscribe(resp => this.articleChangeEmitter.emit(resp));
        this.subscriptions.push(sub);
    }

    isDisplay() {
        return this.pageType == 'display-article';
    }

    isCreate() {
        return this.pageType == 'create-article';
    }

    isEdit() {
        return this.pageType == 'edit-article';
    }

    isHome() {
        return this.pageType == 'home';
    }

    setArticle(event: Article) {
        this.article = event;
        let sub = this.wikiService.getArticleLatestContent(this.article.idArticle).subscribe(resp => {
            this.latestContent = resp;
            let sub = this.userService.getSingleUser(this.latestContent.revision.author.id).subscribe(resp => this.author = resp);
            this.subscriptions.push(sub);
        });
        this.subscriptions.push(sub);
        if (this.isHome()) {
            this.setDisplay();
        }
    }

    private setDisplay() {
        this.pageType = 'display-article'
        this.pageTypeEmitter.emit(this.pageType);
    }
}
