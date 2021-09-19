import {Component, Input, OnInit} from '@angular/core';
import {BaseModule} from "../../../services/swagger";

@Component({
    selector: 'app-base-module-display',
    templateUrl: './base-module-display.component.html',
    styleUrls: ['./base-module-display.component.scss']
})
export class BaseModuleDisplayComponent implements OnInit {

    /**
     * the module which should be displayed
     */
    @Input()
    moduleInput!: BaseModule;

    /**
     * the amount to display
     */
    @Input()
    amountInput?: number;

    /**
     * the alignment to display
     */
    @Input()
    alignmentInput?: string;

    constructor() {
    }

    ngOnInit(): void {
    }

    createTitle() {
        let title: string = "";
        if (this.amountInput!) {
            title += this.amountInput + "x ";
        }
        title += this.moduleInput.name;
        if (this.alignmentInput!) {
            title += " @" + this.alignmentInput;
        }
        return title;
    }
}
