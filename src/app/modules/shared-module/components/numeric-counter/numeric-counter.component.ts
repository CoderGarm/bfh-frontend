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
     * holds the internal value
     */
    internalAmount: number = this.startAt;

    /**
     * defines the minimum value
     */
    @Input()
    min: number = Number.MIN_VALUE;

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

    constructor() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes["startAt"]) {
            this.internalAmount = this.startAt;
        }
    }

    ngOnInit(): void {
    }

    getAmount(): number {
        return this.internalAmount;
    }

    sub() {
        if (this.internalAmount - 1 >= this.min) {
            this.internalAmount--;
            this.fire();
        }
    }

    add() {
        if (this.internalAmount + 1 <= this.max) {
            this.internalAmount++;
            this.fire();
        }
    }

    private fire() {
        this.amount.emit(this.internalAmount);
    }
}
