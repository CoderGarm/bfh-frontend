import {Component, Input, OnInit} from '@angular/core';
import {CapabilityValue, EModuleType, Fleet, SpacecraftCapabilities} from "../../../services/swagger";

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

    constructor() {
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
            console.log("Capability value for module type " + moduleType.typeName + " can't be displayed because base is away.");
            return 100;
        }

        let currentCapValues = this.currentFleetCapabilities.capabilities.filter(cap => cap.moduleType.typeName === moduleType.typeName);
        if (!currentCapValues || currentCapValues.length != 1) {
            console.log("Capability value for module type " + moduleType.typeName + " can't be displayed because current is away.");
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

    static getCurrentCaps(moduleTypes: EModuleType[], fleet?: Fleet) {
        if (!fleet) {
            return undefined;
        }

        const map = new Map<string, number>();
        moduleTypes.forEach(m => map.set(m.typeName, 0));

        const healthStates = fleet.ships.map(warship => {
            let caps: SpacecraftCapabilities;
            const healthState = warship.warshipHealthState;
            if (!!healthState) {
                caps = healthState.spacecraftCapabilities;
            } else {
                caps = warship.shipClass.shipClassCapabilities;
            }
            return caps;
        });

        healthStates.forEach(spacecraftCapabilities => {
            spacecraftCapabilities.capabilities.forEach(cap => {
                const moduleType = cap.moduleType;
                const value = cap.value;
                const currentAmount = map.get(moduleType.typeName);
                if (moduleType.typeName.includes('PROPULSION')) {
                    // speeds will not be added - the  lowest one defines the fleets speed
                    if (!currentAmount || value < currentAmount) {
                        map.set(moduleType.typeName, value);
                    }
                } else {
                    const toAdd = !!currentAmount ? currentAmount : 0;
                    map.set(moduleType.typeName, value + toAdd);
                }
            });
        });

        const caps: SpacecraftCapabilities = {
            capabilities: moduleTypes.map(m => {
                const cap: CapabilityValue = {
                    moduleType: m,
                    value: map.get(m.typeName)!
                }
                return cap;
            })
        }
        return caps;
    }
}
