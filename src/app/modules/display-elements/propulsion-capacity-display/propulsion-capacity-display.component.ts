import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {PropulsionCapacity} from "../../../services/swagger";

@Component({
    selector: 'app-propulsion-capacity-display',
    templateUrl: './propulsion-capacity-display.component.html',
    styleUrls: ['./propulsion-capacity-display.component.scss']
})
export class PropulsionCapacityDisplayComponent implements OnChanges {

    displayedColumns: string[] = ['hyperBand', 'timeToVMax', 'acceleration', 'velocity'];

    @Input()
    capacities: PropulsionCapacity[] = [];

    ngOnChanges(changes: SimpleChanges) {
        this.capacities = this.capacities.filter(e => e.timeToVMax.coordinate > 0);
    }
}
