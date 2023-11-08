import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FleetMovement} from "../../../services/swagger";

@Component({
    selector: 'app-finished-movement-list',
    templateUrl: './finished-movement-list.component.html',
    styleUrls: ['./finished-movement-list.component.scss']
})
export class FinishedMovementListComponent implements OnChanges {

    @Input()
    finishedMovements: FleetMovement[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['finishedMovements']) {
            this.finishedMovements = this.finishedMovements.sort((a, b) => this.sortByAlertness(a, b));
        }
    }

    private sortByAlertness(a: FleetMovement, b: FleetMovement) {
        if (a.isForeignFleet && !b.isForeignFleet) {
            return -1;
        }
        if (!a.isForeignFleet && b.isForeignFleet) {
            return 1;
        }
        return a.isForeignFleet && b.isForeignFleet ? -1 : 1;
    }
}
