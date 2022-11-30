import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';

@Component({
    selector: 'app-numeric-slider-counter',
    templateUrl: './numeric-slider-counter.component.html',
    styleUrls: ['./numeric-slider-counter.component.scss']
})
export class NumericSliderCounterComponent implements OnInit, OnChanges {

    /**
     * the base start amount if not changes
     */
    @Input()
    amount: number = 0;

    /**
     * the currently selected amount
     */
    @Output()
    amountChange: EventEmitter<number> = new EventEmitter<number>();

    /**
     * defines the minimum value
     */
    @Input()
    leftAvailableValue: number = -Number.MAX_VALUE;

    /**
     * defines the maximum value
     */
    @Input()
    rightAvailableValue: number = Number.MAX_VALUE;

    @Input()
    disabled: boolean = false;

    @Input()
    thumbLabel: boolean = false;

    /**
     * The caption of the field.
     */
    @Input()
    caption: string = '';

    @Input()
    ngClass: string = 'small';

    lastValue: number = this.amount;

    @Input()
    limitLeft: number = 0;

    @Input()
    stopLimitLastValue: number = 0;

    @Input()
    disabledLeft: boolean = false;

    @Input()
    disabledRight: boolean = false;

    constructor() {
        throw new Error("Please repair me before usage.");
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['stopLimitLastValue']) {
            this.mouseup();
        }
    }

    ngOnInit(): void {
    }

    private fire() {
        let toTransfer = this.amount - this.lastValue;
        this.amountChange.emit(toTransfer);
        this.lastValue = this.amount;
    }

    /**
     * Accepts the new absolute value and emits it as difference to the last fired amount.
     */
    input(value: number | null) {
        if (!!value) {
            this.amount = value;
            this.fire();
        }
    }

    setLeft() {
        // smaller of free capacity vs available value
        const minValue = -Math.min(Math.abs(this.limitLeft), Math.abs(this.rightAvailableValue));
        this.lastValue = 0;// fire absolute value
        this.input(minValue);
    }

    setRight() {
        // available value
        let availableAmount;
        if (this.amount < 0) {
            availableAmount = Math.abs(this.amount) + Math.abs(this.leftAvailableValue);
        } else {
            availableAmount = Math.abs(this.leftAvailableValue) - Math.abs(this.amount);
        }
        this.lastValue = 0;// fire absolute value
        this.input(availableAmount);
    }

    mouseup() {
        if (this.disabledLeft || this.disabledRight) {
            this.amount = this.stopLimitLastValue;
        }
    }
}
