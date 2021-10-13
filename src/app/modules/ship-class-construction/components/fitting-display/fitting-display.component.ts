import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Subscription} from "rxjs";
import {ShipClass} from "../../../../services/swagger";

@Component({
    selector: 'app-fitting-display',
    templateUrl: './fitting-display.component.html',
    styleUrls: ['./fitting-display.component.scss']
})
export class FittingDisplayComponent implements AfterViewInit, OnChanges {

    private subscriptions: Subscription[] = [];

    /**
     * The user selected ShipClass.
     */
    @Input()
    selectedShipClassInput?: ShipClass;
    selectedShipClassInputDefinition: string = "selectedShipClassInput";

    /**
     * listens to the parents event which tab is selected
     */
    @Input()
    selectedIndexInput?: EventEmitter<number>;
    selectedIndexInputDefinition: string = "selectedIndexInput";

    /**
     * emits an event if this component was selected in the parent's tab group and was rendered
     */
    @Output()
    isSelectedOutput: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**
     * the css selector which should be used to create the svg div in the svg component
     */
    svgSelector: string = "ship-class-fitting-display";

    /**
     * the displayed ship class name
     */
    shipClassName: string = "";

    constructor() {
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedIndexInputDefinition]) {
            if (!!this.selectedIndexInput) {
                let sub = this.selectedIndexInput.subscribe(event => {
                    if (event == 0) {
                        this.isSelectedOutput.emit(true);
                    }
                });
                this.subscriptions.push(sub);
            }
        }
        if (changes[this.selectedShipClassInputDefinition]) {
            if (!!this.selectedShipClassInput) {
                this.shipClassName = this.selectedShipClassInput.name;
            } else {
                this.shipClassName = "";
            }
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
