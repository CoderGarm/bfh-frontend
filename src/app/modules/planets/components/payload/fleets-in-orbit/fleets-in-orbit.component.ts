import {Component, Input, OnInit} from '@angular/core';
import {Fleet} from "../../../../../services/swagger";

@Component({
    selector: 'app-fleets-in-orbit',
    templateUrl: './fleets-in-orbit.component.html',
    styleUrls: ['./fleets-in-orbit.component.scss']
})
export class FleetsInOrbitComponent implements OnInit {

    @Input()
    fleetsInOrbit?: Fleet[];

    constructor() {
    }

    ngOnInit(): void {
    }

    getPercentage(fleet: Fleet) {
        let max = 0;
        fleet.spacecraftCapabilities.capabilities.forEach(value => max += value.value);

        let current = 0;
        const currentCaps = fleet.spacecraftCapabilities;
        if (!currentCaps) {
            current = max;
        } else {
            currentCaps.capabilities.forEach(value => current += value.value);
        }
        return Math.round((current / max) * 100);
    }
}
