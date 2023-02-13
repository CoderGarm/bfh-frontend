import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {CapabilityValue, Fleet, SpacecraftCapabilities} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";
import {NumberShortPipe} from "../../../services/pipes/number-short.pipe";
import {NumberThousandSeparatorPipe} from "../../../services/pipes/number-thousand-separator.pipe";

@Component({
    selector: 'app-spacecraft-capabilities-display',
    templateUrl: './spacecraft-capabilities-display.component.html',
    styleUrls: ['./spacecraft-capabilities-display.component.scss']
})
export class SpacecraftCapabilitiesDisplayComponent extends SubscriptionManager implements OnInit, OnChanges {

    /**
     * the base data to display
     */
    @Input()
    baseFleetCapabilities?: SpacecraftCapabilities;

    @Input()
    currentFleetCapabilities?: SpacecraftCapabilities;

    @Input()
    ngClass: string = "";

    @Input()
    fleet?: Fleet;

    constructor(private numberShortPipe: NumberShortPipe,
                private numberThousandSeparatorPipe: NumberThousandSeparatorPipe) {
        super();
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['fleet']) {
            if (!!this.fleet) {
                this.baseFleetCapabilities = this.fleet.baseSpacecraftCapabilities;
                this.currentFleetCapabilities = this.fleet.spacecraftCapabilities;
            } else {
                this.baseFleetCapabilities = undefined;
                this.currentFleetCapabilities = undefined;
            }
        }
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

        let currentValue = '-1';
        let currentCapValues = this.currentFleetCapabilities?.capabilities.filter(cap => cap.moduleType.typeName === moduleType.typeName);
        if (!!currentCapValues && currentCapValues.length == 1) {
            currentValue = this.numberThousandSeparatorPipe.transform(currentCapValues[0].value);
        }

        let baseValue = '-1';
        let baseCapValues = this.baseFleetCapabilities?.capabilities.filter(cap => cap.moduleType.typeName === moduleType.typeName);
        if (!!baseCapValues && baseCapValues.length == 1) {
            baseValue = this.numberThousandSeparatorPipe.transform(baseCapValues[0].value);
        }

        if (currentValue === '-1') {
            currentValue = baseValue;
        }

        return currentValue + " / " + baseValue;
    }

    getCapValueInShort(cap: CapabilityValue) {
        let moduleType = cap.moduleType;

        let currentValue = '-1';
        let currentCapValues = this.currentFleetCapabilities?.capabilities.filter(cap => cap.moduleType.typeName === moduleType.typeName);
        if (!!currentCapValues && currentCapValues.length == 1) {
            currentValue = this.numberShortPipe.transform(currentCapValues[0].value);
        }

        let baseValue = '-1';
        let baseCapValues = this.baseFleetCapabilities?.capabilities.filter(cap => cap.moduleType.typeName === moduleType.typeName);
        if (!!baseCapValues && baseCapValues.length == 1) {
            baseValue = this.numberShortPipe.transform(baseCapValues[0].value);
        }

        if (currentValue === '-1') {
            currentValue = baseValue;
        }

        return currentValue + " / " + baseValue;
    }
}
