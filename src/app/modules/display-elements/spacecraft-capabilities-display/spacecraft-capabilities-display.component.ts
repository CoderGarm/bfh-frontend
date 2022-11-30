import {Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {CapabilityValue, SpacecraftCapabilities} from "../../../services/swagger";

@Component({
    selector: 'app-spacecraft-capabilities-display',
    templateUrl: './spacecraft-capabilities-display.component.html',
    styleUrls: ['./spacecraft-capabilities-display.component.scss']
})
export class SpacecraftCapabilitiesDisplayComponent implements OnInit {

    /**
     * the base data to display
     */
    @Input()
    baseFleetCapabilities?: SpacecraftCapabilities;

    @Input()
    currentFleetCapabilities?: SpacecraftCapabilities;

    @Input()
    ngClass: string = "";

    constructor(@Optional() @Inject('baseFleetCapabilities') base: SpacecraftCapabilities | undefined,
                @Optional() @Inject('currentFleetCapabilities') current: SpacecraftCapabilities | undefined) {
        this.baseFleetCapabilities = base;
        this.currentFleetCapabilities = current;
    }

    ngOnInit(): void {
    }

    getLink(cap: CapabilityValue): any {
        let iconName = cap.moduleType.iconName;
        let folder = cap.moduleType.folder;
        return "assets/" + folder + "/png24x/" + iconName + "_c.png";
    }

    getPercentage(cap: CapabilityValue) {
        let moduleType = cap.moduleType;
        if (!this.currentFleetCapabilities || !this.baseFleetCapabilities) {
            return 100;
        }

        let baseCapValues = this.baseFleetCapabilities.capabilities.filter(cap => cap.moduleType.typeName === moduleType.typeName);
        if (!baseCapValues || baseCapValues.length != 1) {
            return 100;
        }

        let currentCapValues = this.currentFleetCapabilities.capabilities.filter(cap => cap.moduleType.typeName === moduleType.typeName);
        if (!currentCapValues || currentCapValues.length != 1) {
            return 100;
        }
        let baseValue = baseCapValues[0];
        let currentValue = currentCapValues[0];
        return (currentValue.value / baseValue.value) * 100;
    }

    getCapValue(cap: CapabilityValue) {
        let moduleType = cap.moduleType;

        let currentValue = -1;
        let currentCapValues = this.currentFleetCapabilities?.capabilities.filter(cap => cap.moduleType.typeName === moduleType.typeName);
        if (!!currentCapValues && currentCapValues.length == 1) {
            currentValue = currentCapValues[0].value;
        }

        let baseValue = -1;
        let baseCapValues = this.baseFleetCapabilities?.capabilities.filter(cap => cap.moduleType.typeName === moduleType.typeName);
        if (!!baseCapValues && baseCapValues.length == 1) {
            baseValue = baseCapValues[0].value;
        }

        if (currentValue == -1) {
            currentValue = baseValue;
        }

        return currentValue + " / " + baseValue;
    }
}
