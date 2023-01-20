import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {SubscriptionManager} from "../../../../SubscriptionManager";
import {EditorInstance} from "angular-markdown-editor";
import {EditorOption} from "angular-markdown-editor/lib/angular-markdown-editor/models";
import {MarkdownService} from "ngx-markdown";
import {ArticleCreate, WikiApiService} from "../../../../services/swagger";
import {TranslationEditorComponent} from "../../../admin/components/payload/translation-editor/translation-editor.component";

@Component({
    selector: 'app-create-article',
    templateUrl: './create-article.component.html',
    styleUrls: ['./create-article.component.scss']
})
export class CreateArticleComponent extends SubscriptionManager implements OnInit {

    @Output()
    createArticle: EventEmitter<ArticleCreate> = new EventEmitter<ArticleCreate>();

    possibleLanguages: string[] = [];

    bsEditorInstance?: EditorInstance;
    editorOptions?: EditorOption;
    title?: string;
    langCode: string = TranslationEditorComponent.DEFAULT_LANGUAGE;

    private template: string = "# I am the title\n"
        + "---\n"
        + "## I am a sub headline\n"
        + "\n"
        + "**Lorem ipsum** dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n"
        + "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n"
        + "\n"
        + "### I'm also important\n"
        + "\n"
        + "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n"
        + "\n"
        + "---\n"
        + "## Another sub headline\n"
        + "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

    markdownText: string = this.template;

    constructor(private markdownService: MarkdownService,
                private wikiApi: WikiApiService) {
        super();
    }

    ngOnInit() {
        this.wikiApi.getPossibleLanguages().subscribe(resp => this.possibleLanguages = resp);
        this.editorOptions = {
            iconlibrary: 'fa',
            fullscreen: {
                enable: false,
                icons: {}
            },
            parser: (val) => this.markdownService.parse(val.trim()),
            onChange: (e) => this.parse(e.getContent()),
            onShow: (e) => this.bsEditorInstance = e
        };
        this.parse(undefined);
    }

    submit() {
        if (!this.title || !this.langCode) {
            return;
        }
        const a: ArticleCreate = {
            title: this.title,
            langCode: this.langCode,
            wikiCategory: "GAME_MECHANICS",
            content: this.markdownText
        }
        this.createArticle.emit(a);
        this.setDefault();
    }

    private setDefault() {
        this.markdownText = this.template;
        this.langCode = TranslationEditorComponent.DEFAULT_LANGUAGE;
        this.parse(undefined);
    }

    private parse(content: any) {
        if (!this.markdownText) {
            this.title = undefined;
            return;
        }
        const split = this.markdownText.split("\n");
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
}
