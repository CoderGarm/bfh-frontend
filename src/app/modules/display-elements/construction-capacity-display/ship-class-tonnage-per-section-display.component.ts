import {Component, Input, OnInit} from '@angular/core';
import {SpacecraftCapacityAreas} from "../../../services/swagger";

@Component({
    selector: 'app-ship-class-tonnage-per-section-display',
    templateUrl: './ship-class-tonnage-per-section-display.component.html',
    styleUrls: ['./ship-class-tonnage-per-section-display.component.scss']
})
export class ShipClassTonnagePerSectionDisplayComponent implements OnInit {

    @Input()
    capacities?: SpacecraftCapacityAreas;

    constructor() {
    }

    ngOnInit(): void {
    }
}
