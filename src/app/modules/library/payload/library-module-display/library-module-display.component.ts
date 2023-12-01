import {Component} from '@angular/core';
import {SubscriptionManager} from "../../../../subscription.manager";
import {ModuleService} from "../../../../services/prefetch/module.service";
import {Armor, BaseModule, ElectronicWarfare, EShipClassType, Launcher, Missile, PassiveModule, Propulsion, Sidewall, Weapon} from "../../../../services/swagger";
import {ChipSelectorValue, ChipSelectorValueResult} from "../../../shared-module/components/chip-selector/chip-selector.component";
import {FittingHelper} from "../../../../services/helper/fitting.helper";
import {TypeService} from "../../../../services/type.service";
import TechnologyTypeEnum = Propulsion.TechnologyTypeEnum;
import HyperBandEnum = Propulsion.HyperBandEnum;

@Component({
    selector: 'app-library-module-display',
    templateUrl: './library-module-display.component.html',
    styleUrls: ['./library-module-display.component.scss']
})
export class LibraryModuleDisplayComponent extends SubscriptionManager {

    private chips: ChipSelectorValueResult[] = [];

    weapons: Weapon[] = [];
    launchers: Launcher[] = [];
    missiles: Missile[] = [];
    armors: Armor[] = [];
    sidewalls: Sidewall[] = [];
    eloka: ElectronicWarfare[] = [];
    passiveModules: PassiveModule[] = [];
    propulsions: Propulsion[] = [];

    shipClassTypeSelection?: EShipClassType;
    armorSelection?: Armor;
    sidewallSelection?: Sidewall;
    elokaSelection?: ElectronicWarfare;

    filteredWeapons: Weapon[] = [];
    filteredLaunchers: Launcher[] = [];
    filteredMissiles: Missile[] = [];
    filteredPassiveModules: PassiveModule[] = [];

    filteredArmors: Armor[] = [];
    filteredSidewalls: Sidewall[] = [];
    filteredEloka: ElectronicWarfare[] = [];
    filteredPropulsions: Propulsion[] = [];
    eHullTypeChipValues: ChipSelectorValue[] = [];


    technologyTypes: TechnologyTypeEnum[] = [TechnologyTypeEnum.CIVIL, TechnologyTypeEnum.MILITARY];
    selectedTechnologyType: TechnologyTypeEnum = TechnologyTypeEnum.CIVIL;
    selectedHyperband: HyperBandEnum = HyperBandEnum.NONE;
    hyperBands: HyperBandEnum[] = this.typeService.hyperBands;
    private shipClassTypes: EShipClassType[] = [];

    constructor(private moduleService: ModuleService,
                private typeService: TypeService) {
        super();

        let sub = this.typeService.shipClassTypes.subscribe(d => {
            this.shipClassTypes = d;
            this.setPossibleShipClassTypes();
        });
        this.subscriptions.push(sub);

        sub = this.moduleService.getWeapons().subscribe(resp => {
            this.weapons = resp;
            this.setPossibleShipClassTypes();
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getLaunchers().subscribe(resp => {
            this.launchers = resp;
            this.setPossibleShipClassTypes();
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getMissiles().subscribe(resp => {
            this.missiles = resp;
            this.setPossibleShipClassTypes();
        });
        this.subscriptions.push(sub);


        sub = this.moduleService.getArmors().subscribe(resp => {
            this.armors = resp;
            this.setPossibleShipClassTypes();
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getSidewalls().subscribe(resp => {
            this.sidewalls = resp;
            this.setPossibleShipClassTypes();
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getElectronicWarfare().subscribe(resp => {
            this.eloka = resp;
            this.setPossibleShipClassTypes();
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getPassiveModules().subscribe(resp => {
            this.passiveModules = resp;
            this.setPossibleShipClassTypes();
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getPropulsions().subscribe(resp => {
            this.propulsions = resp;
            this.setPossibleShipClassTypes();
        });
        this.subscriptions.push(sub);
    }

    private setPossibleShipClassTypes() {
        this.eHullTypeChipValues = [];
        const set = new Set<string>();
        this.weapons.map(m => m.baseModule.shipClassType!.typeName).forEach(n => set.add(n));
        this.launchers.map(m => m.baseModule.shipClassType!.typeName).forEach(n => set.add(n));
        this.armors.map(m => m.baseModule.shipClassType!.typeName).forEach(n => set.add(n));
        this.sidewalls.map(m => m.baseModule.shipClassType!.typeName).forEach(n => set.add(n));
        this.eloka.map(m => m.baseModule.shipClassType!.typeName).forEach(n => set.add(n));
        this.passiveModules.map(m => m.baseModule.shipClassType!.typeName).forEach(n => set.add(n));

        const arr = Array.from(set);
        this.eHullTypeChipValues.push(...this.shipClassTypes
            .filter(t => arr.includes(t.type))
            .map((type: EShipClassType) => ({value: type.type, trailingIcon: type})));
    }

    selectTechnologyType(type: TechnologyTypeEnum) {
        this.selectedTechnologyType = type;
        this.filterDisplayedItems();
    }

    selectHyperband(type: HyperBandEnum) {
        this.selectedHyperband = type;
        this.filterDisplayedItems();
    }

    filterDisplayedItems(chips?: ChipSelectorValueResult[]) {
        if (!chips) {
            chips = this.chips;
        } else {
            this.chips = chips;
        }
        const selectedTypeNames: string[] = chips.filter(c => c.selected).map(c => c.chipValue);

        this.passiveModules.forEach(module => this.addOrRemoveMultiSelectionModule(selectedTypeNames, module, this.filteredPassiveModules));
        this.launchers.forEach(module => this.addOrRemoveMultiSelectionModule(selectedTypeNames, module, this.filteredLaunchers));
        this.missiles.forEach(module => this.addOrRemoveMultiSelectionModule(selectedTypeNames, module, this.filteredMissiles));
        this.weapons.forEach(module => this.addOrRemoveMultiSelectionModule(selectedTypeNames, module, this.filteredWeapons));

        this.armors.forEach(module => this.addOrRemoveSingleSelectModule(selectedTypeNames, module, this.filteredArmors, this.armorSelection));
        this.sidewalls.forEach(module => this.addOrRemoveSingleSelectModule(selectedTypeNames, module, this.filteredSidewalls, this.sidewallSelection));
        this.eloka.forEach(module => this.addOrRemoveSingleSelectModule(selectedTypeNames, module, this.filteredEloka, this.elokaSelection));
        this.propulsions.forEach(module => this.addOrRemovePropulsion(module));
    }

    private addOrRemoveMultiSelectionModule<MODULE extends Weapon | Launcher | Missile | PassiveModule>(selectedTypeNames: string[],
                                                                                              module: MODULE,
                                                                                                        filteredElements: MODULE[]) {
        let id: string;
        if ('supportType' in module) {
            id = FittingHelper.getPassiveMapKey(module);
        }

        const hullTypeName = module.baseModule.shipClassType?.typeName;
        const matchedSelectedHull = !!this.shipClassTypeSelection && this.shipClassTypeSelection.typeName === hullTypeName;
        if ((!!hullTypeName && selectedTypeNames.includes(hullTypeName)) || matchedSelectedHull) {
            if (!filteredElements.includes(module)) {
                filteredElements.push(module);
            }
        } else {
            this.removeIfPresent(filteredElements, module);
        }
    }

    private addOrRemoveSingleSelectModule<MODULE extends { baseModule: BaseModule }>(
        selectedTypeNames: string[],
        module: MODULE,
        elements: MODULE[],
        selection: MODULE | undefined) {
        if (this.isPushCandidate(selectedTypeNames, module, selection)) {
            if (elements.filter(h => h.baseModule.shipClassType!.typeName === module.baseModule.shipClassType!.typeName).length == 0) {
                elements.push(module);
            }
        } else {
            this.removeIfPresent(elements, module);
        }
    }

    private addOrRemovePropulsion(module: Propulsion) {
        if (this.propulsionMatchesConditions(module)) {
            this.addIfNotPresent(this.filteredPropulsions, module);
        } else {
            this.removeIfPresent(this.filteredPropulsions, module);
        }
    }

    private propulsionMatchesConditions(module: Propulsion) {
        return module.technologyType === this.selectedTechnologyType && module.hyperBand === this.selectedHyperband;
    }

    private addIfNotPresent<MODULE>(elements: MODULE[], module: MODULE) {
        const indexOf = elements.indexOf(module);
        if (indexOf == -1) {
            elements.push(module);
        }
    }

    private removeIfPresent<MODULE>(elements: MODULE[], module: MODULE) {
        const indexOf = elements.indexOf(module);
        if (indexOf != -1) {
            elements.splice(indexOf, 1);
        }
    }

    private isPushCandidate<MODULE extends {
        baseModule: BaseModule,
        technologyType?: TechnologyTypeEnum
    }>(selectedTypeNames: string[], candidate: MODULE, selection: MODULE | undefined) {
        const baseModule: BaseModule = candidate.baseModule;
        const shipClassType = baseModule.shipClassType;
        if (!!shipClassType) {
            const typeName = shipClassType.typeName;
            const matchedSelectedHull = !!this.shipClassTypeSelection && this.shipClassTypeSelection.typeName === shipClassType.typeName;
            const moduleSelected = !!selection && selection.baseModule.idModule === baseModule.idModule;
            return (!!typeName && selectedTypeNames.includes(typeName)) || matchedSelectedHull || moduleSelected;
        }
        return !!candidate.technologyType && candidate.technologyType === this.selectedTechnologyType;
    }
}
