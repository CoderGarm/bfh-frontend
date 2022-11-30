import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-amount-shifter',
    templateUrl: './amount-shifter.component.html',
    styleUrls: ['./amount-shifter.component.scss']
})
export class AmountShifterComponent implements OnInit {

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
    caption: string = '';

    @Input()
    limitLeft: number = 0;

    @Input()
    disabledLeft: boolean = false;

    @Input()
    disabledRight: boolean = false;

    constructor() {
    }

    ngOnInit(): void {
    }

    input(value: number) {
        this.leftAvailableValue += value;
        this.rightAvailableValue += value;
        this.amountChange.emit(value);
    }

    setLeft(number: number) {
        let minValue;
        if (number < 0) {
            minValue = Math.min(Math.abs(this.limitLeft), Math.abs(this.rightAvailableValue));
        } else {
            minValue = Math.min(Math.abs(number), Math.abs(this.limitLeft), Math.abs(this.rightAvailableValue));
        }
        this.input(-minValue);
    }

    setRight(number: number) {
        let minValue;
        if (number < 0) {
            minValue = Math.min(Math.abs(this.leftAvailableValue));
        } else {
            minValue = Math.min(Math.abs(number), Math.abs(this.leftAvailableValue));
        }
        this.input(minValue);
    }
}
