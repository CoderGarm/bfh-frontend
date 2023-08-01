import {Component, Input, OnInit} from '@angular/core';
import {CapabilityValue, EModuleType, SpacecraftCapabilities} from "../../../services/swagger";

@Component({
    selector: 'app-spacecraft-capability-display-small',
    templateUrl: './spacecraft-capability-display-small.component.html',
    styleUrls: ['./spacecraft-capability-display-small.component.scss']
})
export class SpacecraftCapabilityDisplaySmallComponent implements OnInit {

    /**
     * the base data to display
     */
    @Input()
    baseFleetCapabilities?: SpacecraftCapabilities;

    @Input()
    currentFleetCapabilities?: SpacecraftCapabilities;

    @Input()
    fightingCapable?: boolean;

    @Input()
    alive?: boolean;

    constructor() {
    }

    ngOnInit(): void {
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

        let currentValue = this.getCurrentCapValue(moduleType);

        let baseValue = this.getBaseCapValue(moduleType);

        if (currentValue == -1) {
            currentValue = baseValue;
        }

        return cap.moduleType.typeName + ' - ' + Math.round(currentValue) + " / " + Math.round(baseValue);
    }

    private getBaseCapValue(moduleType: EModuleType) {
        let baseValue = -1;
        let baseCapValues = this.baseFleetCapabilities?.capabilities.filter(cap => cap.moduleType.typeName === moduleType.typeName);
        if (!!baseCapValues && baseCapValues.length == 1) {
            baseValue = baseCapValues[0].value;
        }
        return baseValue;
    }

    private getCurrentCapValue(moduleType: EModuleType) {
        let currentValue = -1;
        let currentCapValues = this.currentFleetCapabilities?.capabilities.filter(cap => cap.moduleType.typeName === moduleType.typeName);
        if (!!currentCapValues && currentCapValues.length == 1) {
            currentValue = currentCapValues[0].value;
        }
        return currentValue;
    }

    getStateClass() {
        let state = this.fightingCapable;
        if (!!state) {
            if (!this.fightingCapable) {
                return "unable has-hit";
            }
        }
        return "";
    }

    getCss(cap: CapabilityValue) {
        let currentValue = this.getCurrentCapValue(cap.moduleType);
        let baseValue = this.getBaseCapValue(cap.moduleType);
        return currentValue === baseValue ? 'unchanged-stat' : '';
    }
}
