import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PassiveModule} from "../../../services/swagger";

@Component({
    selector: 'app-passive-module-counter',
    templateUrl: './passive-module-counter.component.html',
    styleUrls: ['./passive-module-counter.component.scss']
})
export class PassiveModuleCounterComponent implements OnInit {


    /**
     * the module which should be displayed
     */
    @Input()
    moduleInput!: PassiveModule;

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

    constructor() {
    }

    ngOnInit(): void {
    }

    /**
     * sets the amount and emits it
     * @param $event
     */
    setAmount($event: number) {
        this.amount.emit($event);
    }
}
