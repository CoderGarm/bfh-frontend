import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FleetMovement} from "../../../services/swagger";
import {coerceBooleanProperty} from "@angular/cdk/coercion";

@Component({
    selector: 'app-fleet-finished-move-display',
    templateUrl: './fleet-finished-move-display.component.html',
    styleUrls: ['./fleet-finished-move-display.component.scss']
})
export class FleetFinishedMoveDisplayComponent implements OnChanges {

    @Input()
    fleetMovement?: FleetMovement;

    // @formatter:off
    @Input()
    get showTitle() { return this._showTitle; }
    set showTitle(value: any) { this._showTitle = coerceBooleanProperty(value); }
    _showTitle: boolean = false;
    // @formatter:on

    destinationRepresentation: string = "";


    ngOnChanges(changes: SimpleChanges): void {
        this.createDestinationRepresentation();
    }

    private createDestinationRepresentation() {
        let destination = "";
        const fm = this.fleetMovement;
        if (!!fm) {
            destination += fm.destinationSystem + ', ';
            destination += !!fm.destinationPlanet ? fm.destinationPlanet : 'hyperlimit';
        }
        this.destinationRepresentation = destination;
    }
}
