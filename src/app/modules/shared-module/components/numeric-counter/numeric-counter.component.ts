import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';

@Component({
    selector: 'app-numeric-counter',
    templateUrl: './numeric-counter.component.html',
    styleUrls: ['./numeric-counter.component.scss']
})
export class NumericCounterComponent implements OnInit, OnChanges {

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
     * defines the minimum value
     */
    @Input()
    min: number = 0;

    /**
     * defines the maximum value
     */
    @Input()
    max: number = Number.MAX_VALUE;

    /**
     * if the input elements must be disabled
     */
    @Input()
    disabled: boolean = false;

    /**
     * The caption of the field.
     */
    @Input()
    caption: string = '';

    @Input()
    inputDisabled: boolean = true;

    @Input()
    ngClass: string = 'small';

    @Input()
    step: number = 1;

    /**
     * holds the internal value
     */
    internalAmount: number = this.startAt;

    constructor() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes["startAt"]) {
            this.internalAmount = this.startAt;
        }
    }

    ngOnInit(): void {
    }

    sub() {
        if (this.internalAmount - this.step >= this.min) {
            this.internalAmount -= this.step;
        } else {
            this.internalAmount = this.min;
        }
        this.fire();
    }

    add() {
        if (this.internalAmount + this.step <= this.max) {
            this.internalAmount += this.step;
        } else {
            this.internalAmount = this.max;
        }
        this.fire();
    }

    private fire() {
        this.amount.emit(this.internalAmount);
    }

    change() {
        if (this.internalAmount > this.max) {
            this.internalAmount = this.max;
        } else if (this.internalAmount < this.min) {
            this.internalAmount = this.min;
        }
        this.fire();
    }
}
