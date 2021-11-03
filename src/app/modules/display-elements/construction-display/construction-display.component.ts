import {AfterViewInit, Component, EventEmitter, Input, Output} from '@angular/core';
import {Construction} from "../../../services/swagger";

@Component({
    selector: 'app-construction-display',
    templateUrl: './construction-display.component.html',
    styleUrls: ['./construction-display.component.scss']
})
export class ConstructionDisplayComponent implements AfterViewInit {

    /**
     * the construction which should be displayed
     */
    @Input()
    constructionInput!: Construction;

    @Output()
    constructionOutput: EventEmitter<Construction> = new EventEmitter<Construction>();

    /**
     * the current selected planet
     * and it's field name
     */
    @Input()
    constructionPossibleInput?: boolean;

    constructor() {
    }

    ngAfterViewInit() {
    }

    buildConstruction() {
        this.constructionOutput.emit(this.constructionInput);
    }
}
