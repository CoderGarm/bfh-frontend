import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {SubscriptionManager} from "../../../../SubscriptionManager";
import {Article, ArticleEdit, ArticlePlainContent} from "../../../../services/swagger";
import {EditorInstance} from "angular-markdown-editor";
import {EditorOption} from "angular-markdown-editor/lib/angular-markdown-editor/models";
import {MarkdownService} from "ngx-markdown";

@Component({
    selector: 'app-edit-article',
    templateUrl: './edit-article.component.html',
    styleUrls: ['./edit-article.component.scss']
})
export class EditArticleComponent extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    article?: Article;

    @Input()
    latestContent?: ArticlePlainContent;

    title?: string;
    langCode?: string;
    content?: string;

    @Output()
    createEdit: EventEmitter<ArticleEdit> = new EventEmitter<ArticleEdit>();

    bsEditorInstance?: EditorInstance;
    editorOptions?: EditorOption;

    constructor(private markdownService: MarkdownService) {
        super();
    }

    ngOnInit() {
        this.editorOptions = {
            iconlibrary: 'fa',
            fullscreen: {
                enable: false,
                icons: {}
            },
            parser: (val) => this.markdownService.compile(val.trim()),
            onChange: (e) => this.parse(e.getContent()),
            onShow: (e) => this.bsEditorInstance = e
        };
        this.parse(undefined);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.setArticleData();
        this.setContent();
    }

    submit() {
        console.log("submit 1")
        if (!this.title || !this.article) {
            return;
        }
        console.log("submit 2")
        const a: ArticleEdit = {
            idArticle: this.article.idArticle,
            title: this.title,
            content: this.content
        }
        console.log(a)
        this.createEdit.emit(a);
    }

    private parse(content: any) {
        if (!this.content) {
            this.title = undefined;
            return;
        }
        const split = this.content.split("\n");
        this.detectTitle(split);
    }

    private detectTitle(split: string[]) {
        for (let i = 0; i < split.length; i++) {
            const line = split[i];
            if (line.startsWith('#')) {
                this.title = line.replace('#', '').trim();
                break;
            }
        }
    }

    canSend() {
        return !(!!this.title && this.title != 'I am the title');
    }

    private setArticleData() {
        if (!!this.article) {
            this.title = this.article.title;
            this.langCode = this.article.langCode;
        }
    }

    private setContent() {
        if (!!this.latestContent) {
            this.content = this.latestContent.content;
        }
    }
}
