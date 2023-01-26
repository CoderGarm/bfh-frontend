import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {EditorInstance} from "angular-markdown-editor";
import {EditorOption} from "angular-markdown-editor/lib/angular-markdown-editor/models";
import * as DOMPurify from "dompurify";
import {MarkdownService} from "ngx-markdown";

@Component({
    selector: 'app-markdown-editor',
    templateUrl: './markdown-editor.component.html',
    styleUrls: ['./markdown-editor.component.scss']
})
export class MarkdownEditorComponent implements OnInit, OnChanges {

    bsEditorInstance?: EditorInstance;
    editorOptions?: EditorOption;

    @Input()
    editableText?: string;

    markdownText: string = '';

    @Output()
    play: EventEmitter<string> = new EventEmitter<string>();

    @Input()
    textareaId: string = Math.random() + "-markdown-editor";

    @Input()
    rows: number = 5;

    constructor(private markdownService: MarkdownService) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!!this.editableText) {
            this.markdownText = this.editableText;
        }
    }

    ngOnInit(): void {
        this.editorOptions = {
            iconlibrary: 'fa',
            fullscreen: {
                enable: false,
                icons: {}
            },
            parser: (val) => {
                const sanitizedText = DOMPurify.sanitize(val.trim());
                this.markdownService.parse(sanitizedText);
            },
            onChange: () => {
            },
            onShow: (e) => this.bsEditorInstance = e
        };
    }

    submitMessage() {
        this.play.emit(this.markdownText);
        this.markdownText = '';
        this.bsEditorInstance!.setContent('');
    }
}
