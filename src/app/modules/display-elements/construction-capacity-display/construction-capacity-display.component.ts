import {Component, Input, OnInit} from '@angular/core';
import {SpacecraftCapacityAreas} from "../../../services/swagger";

@Component({
    selector: 'app-construction-capacity-display',
    templateUrl: './construction-capacity-display.component.html',
    styleUrls: ['./construction-capacity-display.component.scss']
})
export class ConstructionCapacityDisplayComponent implements OnInit {

    @Input()
    capacities?: SpacecraftCapacityAreas;

    constructor() {
    }

    ngOnInit(): void {
    }

}
