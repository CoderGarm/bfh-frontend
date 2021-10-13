import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BaseModule} from "../../../services/swagger";

@Component({
    selector: 'app-base-module-counter',
    templateUrl: './base-module-counter.component.html',
    styleUrls: ['./base-module-counter.component.scss']
})
export class BaseModuleCounterComponent implements OnInit {

    /**
     * the module which should be displayed
     */
    @Input()
    moduleInput!: BaseModule;

    /**
     * the alignment to display
     */
    @Input()
    alignmentInput?: string;

    /**
     * the base start amount if not changes
     */
    @Input()
    startAt: number = 0;

    /**
     * the currently selected amount
     */
    @Output()
    amount: EventEmitter<number> = new EventEmitter<number>();

    /**
     * holds the internal value
     */
    internalAmount: number = this.startAt;

    /**
     * defines the minimum value
     */
    @Input()
    min: number = 0;

    /**
     * defines the maximum value
     */
    @Input()
    max: number = Number.MAX_VALUE;

    constructor() {
    }

    ngOnInit(): void {
    }

    createTitle() {
        let title: string = "";
        if (!!this.internalAmount) {
            title += this.internalAmount + "x ";
        }
        title += this.moduleInput.name;
        if (!!this.alignmentInput) {
            title += " @" + this.alignmentInput;
        }
        return title;
    }

    /**
     * sets the amount and emits it
     * @param $event
     */
    setAmount($event: number) {
        this.amount.emit($event);
    }
}
