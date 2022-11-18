import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Article, ArticlePlainContent, UserJson} from "../../../../services/swagger";
import {SubscriptionManager} from "../../../../SubscriptionManager";

@Component({
    selector: 'app-display-article',
    templateUrl: './display-article.component.html',
    styleUrls: ['./display-article.component.scss']
})
export class DisplayArticleComponent extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    article?: Article;

    @Input()
    author?: UserJson;

    @Input()
    latestContent?: ArticlePlainContent;

    authorName?: string;
    revision?: string;
    content?: string;

    constructor() {
        super();
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        this.setAuthorName();
        this.setRevision();
        this.setContent();
    }

    private setAuthorName() {
        if (!!this.author) {
            this.authorName = this.author.username;
        }
    }

    private setRevision() {
        if (!!this.latestContent) {
            this.revision = this.latestContent.revision.version + '';
        }
    }

    private setContent() {
        if (!!this.latestContent) {
            this.content = this.latestContent.content;
        }
    }
}
