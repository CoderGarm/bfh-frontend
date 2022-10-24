import {Component, Input, OnInit} from '@angular/core';
import {CapabilityValue, SpacecraftCapabilities} from "../../../services/swagger";

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
    currentFleetState?: SpacecraftCapabilities;

    @Input()
    fightingCapable?: boolean;

    @Input()
    alive?: boolean;

    @Input()
    ngClass: string = "";

    constructor() {
    }

    ngOnInit(): void {
    }

    getLink(cap: CapabilityValue): any {
        let iconName = cap.moduleType.iconName;
        let folder = cap.moduleType.folder;
        return "assets/" + folder + "/png16x/" + iconName + "_c.png";
    }

    getPercentage(cap: CapabilityValue) {
        let moduleType = cap.moduleType;
        if (!this.currentFleetState || !this.baseFleetCapabilities) {
            return 100;
        }

        let baseCapValues = this.baseFleetCapabilities.capabilities.filter(cap => cap.moduleType.typeName === moduleType.typeName);
        if (!baseCapValues || baseCapValues.length != 1) {
            return 100;
        }

        let currentCapValues = this.currentFleetState.capabilities.filter(cap => cap.moduleType.typeName === moduleType.typeName);
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
        let currentCapValues = this.currentFleetState?.capabilities.filter(cap => cap.moduleType.typeName === moduleType.typeName);
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

        return cap.moduleType.typeName + ' - ' + currentValue + " / " + baseValue;
    }

    getStateClass() {
        let state = this.fightingCapable;
        if (!!state) {
            if (!this.fightingCapable) {
                return "unable";
            }
        }
        return "";
    }
}