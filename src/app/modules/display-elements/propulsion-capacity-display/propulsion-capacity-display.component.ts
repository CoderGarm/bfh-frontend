import {Component, Input} from '@angular/core';
import {PropulsionCapacity} from "../../../services/swagger";

@Component({
    selector: 'app-propulsion-capacity-display',
    templateUrl: './propulsion-capacity-display.component.html',
    styleUrls: ['./propulsion-capacity-display.component.scss']
})
export class PropulsionCapacityDisplayComponent {

    displayedColumns: string[] = ['hyperBand', 'timeToVMax', 'acceleration', 'velocity'];

    @Input()
    capacities: PropulsionCapacity[] = [];
}
