import {Component, Input, OnInit} from '@angular/core';
import {EModuleType, Fleet} from "../../../../../services/swagger";
import {SpacecraftCapabilitiesDisplayComponent} from "../../../../display-elements/spacecraft-capabilities-display/spacecraft-capabilities-display.component";
import {TypeService} from "../../../../../services/type.service";

@Component({
    selector: 'app-fleets-in-orbit',
    templateUrl: './fleets-in-orbit.component.html',
    styleUrls: ['./fleets-in-orbit.component.scss']
})
export class FleetsInOrbitComponent implements OnInit {

    @Input()
    fleetsInOrbit?: Fleet[];

    private readonly moduleTypes: EModuleType[];

    constructor(private typeService: TypeService) {
        this.moduleTypes = typeService.eModuleTypes;
    }

    ngOnInit(): void {
    }


    getCurrentCaps(fleet?: Fleet) {
        return SpacecraftCapabilitiesDisplayComponent.getCurrentCaps(this.moduleTypes, fleet);
    }

    getPercentage(fleet: Fleet) {
        let max = 0;
        fleet.fleetCapabilities?.capabilities.forEach(value => max += value.value);

        let current = 0;
        const currentCaps = this.getCurrentCaps(fleet);
        if (!currentCaps) {
            current = max;
        } else {
            currentCaps.capabilities.forEach(value => current += value.value);
        }
        return Math.round((current / max) * 100);
    }
}
