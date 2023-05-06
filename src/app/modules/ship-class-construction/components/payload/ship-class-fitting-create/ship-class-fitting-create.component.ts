import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Output} from '@angular/core';
import {
    AlignedFitting,
    AmmunitionFitting,
    Armor,
    BaseModule,
    ElectronicWarfare,
    EnumValueDto,
    EShipClassType,
    Launcher,
    Mass,
    Missile,
    PassiveModule,
    Propulsion,
    PropulsionCapacity,
    ShipClass,
    ShipClassMock,
    ShipyardApiService,
    Sidewall,
    SupportFitting,
    Weapon
} from "../../../../../services/swagger";
import {ModuleService} from "../../../../../services/prefetch/module.service";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {ChipSelectorValue, ChipSelectorValueResult} from "../../../../shared-module/components/chip-selector/chip-selector.component";
import {FittingHelper} from "../../../../../services/helper/fitting.helper";
import {TypeService} from "../../../../../services/type.service";
import {WeaponsSelection} from "../../../../display-elements/weapon-per-alingment-counter/weapon-per-alignment-counter.component";
import {ShipClassHelper} from "../ship-class.helper";
import {ShipClassValidator} from "../ship-class.validator";
import EWeaponTypeEnum = EnumValueDto.EWeaponTypeEnum;
import EAlignmentTypeEnum = EnumValueDto.EAlignmentTypeEnum;
import EWeaponAlignmentEnum = EnumValueDto.EWeaponAlignmentEnum;
import TechnologyTypeEnum = EnumValueDto.ETechnologyTypesEnum;
import HyperBandEnum = EnumValueDto.EHyperBandsEnum;
import WeaponTypeEnum = EnumValueDto.EWeaponTypeEnum;

@Component({
    selector: 'app-ship-class-fitting-create',
    templateUrl: './ship-class-fitting-create.component.html',
    styleUrls: ['./ship-class-fitting-create.component.scss']
})
export class ShipClassFittingCreateComponent extends SubscriptionManager implements AfterViewInit {

    /**
     * emits the least changes in the given ship class
     */
    @Output()
    shipClassMockEmitter: EventEmitter<ShipClassMock> = new EventEmitter<ShipClassMock>();

    /**
     * emits the least changes in the given ship class
     */
    @Output()
    weaponsAmountByAlignmentOutput: EventEmitter<Map<AlignedFitting.WeaponAlignmentEnum, number>> = new EventEmitter<Map<AlignedFitting.WeaponAlignmentEnum, number>>();

    shipClassMock?: ShipClassMock;

    private propulsionCapacityCache: Map<string, PropulsionCapacity[]> = new Map<string, PropulsionCapacity[]>();

    /**
     * the modules to select from
     */
    weapons: Weapon[] = [];
    launchers: Launcher[] = [];
    missiles: Missile[] = [];
    private weaponsDescriptions: Map<EWeaponTypeEnum, string> = new Map<EWeaponTypeEnum, string>();
    weaponsDescription: string = '';
    armors: Armor[] = [];
    sidewalls: Sidewall[] = [];
    eloka: ElectronicWarfare[] = [];
    passiveModules: PassiveModule[] = [];
    propulsions: Propulsion[] = [];

    /**
     * Just to store the name's and description's text.
     */
    exampleArmor?: Armor;
    exampleEloka?: ElectronicWarfare;
    exampleSidewall?: Sidewall;

    /**
     * the maps which are holding the user's selections
     */
    weaponsSelection: Map<string, number> = new Map<string, number>();
    ammoSelection: Map<string, number> = new Map<string, number>();
    supportSelection: Map<string, number> = new Map<string, number>();
    /**
     * the single selection items
     */
    shipClassTypeSelection?: EShipClassType;
    propulsionSelection?: Propulsion;
    hoveredArmor?: Armor;
    armorSelection?: Armor;
    hoveredSidewall?: Sidewall;
    sidewallSelection?: Sidewall;
    hoveredPassiveModule?: PassiveModule;
    passiveModuleSelection?: PassiveModule;
    hoveredEloka?: ElectronicWarfare;
    elokaSelection?: ElectronicWarfare;

    filteredWeapons: Weapon[] = [];
    filteredLaunchers: Launcher[] = [];
    filteredPassiveModules: PassiveModule[] = [];

    filteredArmors: Armor[] = [];
    filteredSidewalls: Sidewall[] = [];
    filteredEloka: ElectronicWarfare[] = [];
    filteredPropulsions: Propulsion[] = [];
    eHullTypeChipValues: ChipSelectorValue[] = [];
    hoveredWeapon?: Weapon | Launcher;
    selectedWeapon?: Weapon | Launcher;

    missileLoadout: Missile[] = [];

    /**
     * the 'should I redraw the weapon slots' validation map to hold the already known values
     * @private
     */
    private validatorMap: Map<AlignedFitting.WeaponAlignmentEnum, number> = new Map<AlignedFitting.WeaponAlignmentEnum, number>();

    alignmentAreas: EAlignmentTypeEnum[];
    weaponTypes: EWeaponTypeEnum[];
    selectedWeaponType: EWeaponTypeEnum = EWeaponTypeEnum.MISSILE;

    technologyTypes: TechnologyTypeEnum[] = [TechnologyTypeEnum.CIVIL, TechnologyTypeEnum.MILITARY];
    selectedTechnologyType: TechnologyTypeEnum = TechnologyTypeEnum.CIVIL;
    selectedHyperband: HyperBandEnum = HyperBandEnum.NONE;
    hyperBands: HyperBandEnum[] = [];

    propulsionCapacity: PropulsionCapacity[] = [];

    private chips: ChipSelectorValueResult[] = [];
    private weaponAlignmentTypes: EWeaponAlignmentEnum[];

    constructor(protected moduleService: ModuleService,
                private shipyardApi: ShipyardApiService,
                protected typeService: TypeService,
                protected change: ChangeDetectorRef) {
        super();

        this.alignmentAreas = this.typeService.alignmentAreas;
        this.weaponTypes = this.typeService.weaponTypes;
        this.weaponAlignmentTypes = this.typeService.weaponAlignmentTypes;
        this.typeService.shipClassTypes.map(type => ({value: type.type})).forEach(ht => {
            if (this.eHullTypeChipValues.filter(t => t.value === ht.value).length === 0) {
                this.eHullTypeChipValues.push(ht);
            }
        });
        this.fetchBaseData();
    }

    ngAfterViewInit(): void {
        this.filterDisplayedItems();
        this.selectPropulsion();
        this.setWeaponDescription();
        this.change.detectChanges();
    }

    protected fetchBaseData() {
        let sub = this.moduleService.getWeaponsByUser().subscribe(resp => {
            this.weapons = resp;
            resp.forEach(w => this.weaponsDescriptions.set(w.weaponType, w.baseModule.description));
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getLaunchersByUser().subscribe(resp => {
            this.launchers = resp;
            this.launchers.forEach(w => this.weaponsDescriptions.set(w.weaponType, w.baseModule.description));
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getLaunchers().subscribe(resp => {
            resp.flatMap(l => l.allowedMissiles).forEach(missile => {
                if (this.missiles.filter(m => m.baseModule.idModule === missile.baseModule.idModule).length === 0) {
                    // add if not already present
                    this.missiles.push(missile);
                }
            });
            resp.forEach(w => this.weaponsDescriptions.set(w.weaponType, w.baseModule.description));
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getArmorsByUser().subscribe(resp => {
            this.armors = resp;
            this.exampleArmor = resp[0];
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getSidewallsByUser().subscribe(resp => {
            this.sidewalls = resp;
            this.exampleSidewall = resp[0];
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getElectronicWarfareByUser().subscribe(resp => {
            this.eloka = resp;
            this.exampleEloka = resp[0];
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getPropulsionsByUser().subscribe(resp => this.propulsions = resp);
        this.subscriptions.push(sub);
        sub = this.moduleService.getPassiveModulesByUser().subscribe(resp => this.passiveModules = resp);
        this.subscriptions.push(sub);
    }

    filterDisplayedItems(chips?: ChipSelectorValueResult[]) {
        if (!chips) {
            chips = this.chips;
        } else {
            this.chips = chips;
        }
        const selectedTypeNames: string[] = chips.filter(c => c.selected).map(c => c.chipValue);

        this.passiveModules.forEach(module => this.addOrRemoveMultiSelectionModule(selectedTypeNames, module, this.filteredPassiveModules, this.supportSelection));
        this.launchers.forEach(module => this.addOrRemoveMultiSelectionModule(selectedTypeNames, module, this.filteredLaunchers, this.weaponsSelection));
        this.weapons.forEach(module => this.addOrRemoveMultiSelectionModule(selectedTypeNames, module, this.filteredWeapons, this.weaponsSelection));

        this.armors.forEach(module => this.addOrRemoveSingleSelectModule(selectedTypeNames, module, this.filteredArmors, this.armorSelection));
        this.sidewalls.forEach(module => this.addOrRemoveSingleSelectModule(selectedTypeNames, module, this.filteredSidewalls, this.sidewallSelection));
        this.eloka.forEach(module => this.addOrRemoveSingleSelectModule(selectedTypeNames, module, this.filteredEloka, this.elokaSelection));
        this.propulsions.forEach(module => this.addOrRemovePropulsion(module));

        this.hyperBands = Array.from(new Set(this.propulsions.map(p => p.hyperBand)));
        this.change.detectChanges();
    }

    private addOrRemoveMultiSelectionModule<MODULE extends Weapon | Launcher | PassiveModule>(selectedTypeNames: string[],
                                                                                              module: MODULE,
                                                                                              filteredElements: MODULE[],
                                                                                              selectionMap: Map<String, number>) {

        let selectedByFilter: boolean = true;
        let id: string;
        if ('supportType' in module) {
            id = FittingHelper.getPassiveMapKey(module);
        } else {
            id = FittingHelper.getWeaponSystemMapKey(module);
            const weapon = <Weapon | Launcher>module;
            if (this.selectedWeaponType != weapon.weaponType) {
                selectedByFilter = false;
            }
        }

        let moduleSelected: boolean = false;
        selectionMap.forEach((value, key) => {
            if (value > 0 && key.startsWith(id)) {
                moduleSelected = true;
            }
        });

        const hullTypeName = module.baseModule.shipClassType?.typeName;
        const matchedSelectedHull = !!this.shipClassTypeSelection && this.shipClassTypeSelection.typeName === hullTypeName;
        if (selectedByFilter && ((!!hullTypeName && selectedTypeNames.includes(hullTypeName)) || matchedSelectedHull || moduleSelected)) {
            if (!filteredElements.includes(module)) {
                filteredElements.push(module);
            }
        } else {
            this.removeIfPresent(filteredElements, module);
        }
    }

    private addOrRemoveSingleSelectModule<MODULE extends {
        baseModule: BaseModule
    }>(selectedTypeNames: string[], module: MODULE, elements: MODULE[], selection: MODULE | undefined) {
        if (this.isPushCandidate(selectedTypeNames, module, selection)) {
            if (elements.filter(h => h.baseModule.shipClassType!.typeName === module.baseModule.shipClassType!.typeName).length == 0) {
                elements.push(module);
            }
        } else {
            this.removeIfPresent(elements, module);
        }
    }

    private addOrRemovePropulsion(module: Propulsion) {
        if (this.propulsionMatchesConditions(module, false)) {
            this.addIfNotPresent(this.filteredPropulsions, module);
        } else {
            this.removeIfPresent(this.filteredPropulsions, module);
        }
    }

    private propulsionMatchesConditions(module: Propulsion, bothConditionsWorking: boolean = true) {
        if (bothConditionsWorking) {
            return module.technologyType === this.selectedTechnologyType && module.hyperBand === this.selectedHyperband;
        } else {
            return module.technologyType === this.selectedTechnologyType;
        }
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

    chooseShipClassType(shipClassType?: EShipClassType) {
        this.shipClassTypeSelection = shipClassType;
        this.createAndEmitDesignedShipClass();
    }

    updateWeaponSelection(loadout: WeaponsSelection) {
        this.setWeaponModule(loadout);
        this.createAndEmitDesignedShipClass();
    }

    choosePassiveModule(amount: number, passive: PassiveModule) {
        this.setPassiveModule(passive, amount);
        this.createAndEmitDesignedShipClass();
    }

    getWeaponSelection(weapon?: Weapon | Launcher): WeaponsSelection | undefined {
        let ammoAmount: number = 0;
        let w: WeaponsSelection | undefined;
        if (!!weapon) {
            w = {
                weapon: weapon,
                weaponAmountPerAlignment: this.getWeaponModuleAmount(weapon),
            }
            return w;
        }
        return undefined;
    }

    getWeaponModuleAmount(weapon: Weapon | Launcher): Map<AlignedFitting.WeaponAlignmentEnum, number> {
        let map = new Map<AlignedFitting.WeaponAlignmentEnum, number>();
        this.weaponAlignmentTypes.forEach(alignment => {
            let id = FittingHelper.getWeaponSystemMapKey(weapon, alignment);
            let amount = this.weaponsSelection.get(id);
            if (!amount) {
                amount = 0;
            }
            map.set(alignment, amount);
        });
        return map;
    }

    checkIfChanged(newData: Map<AlignedFitting.WeaponAlignmentEnum, number>): boolean {
        let result: boolean = false;
        this.weaponAlignmentTypes.forEach(alignment => {
            let oldAmount = this.validatorMap.get(alignment);
            if (!oldAmount) {
                oldAmount = 0;
            }
            let newAmount = newData.get(alignment);
            if (!newAmount) {
                newAmount = 0;
            }
            if (oldAmount != newAmount) {
                result = true;
            }
        });
        if (result) {
            this.validatorMap = newData;
        }
        return result;
    }

    setWeaponModule(weapon: WeaponsSelection) {
        let event: Map<AlignedFitting.WeaponAlignmentEnum, number> = new Map<AlignedFitting.WeaponAlignmentEnum, number>();
        weapon.weaponAmountPerAlignment.forEach((amount, alignment) => {
            // set the current selection to data structure
            let id: string = FittingHelper.getWeaponSystemMapKey(weapon.weapon, alignment);
            this.weaponsSelection.set(id, amount);
        });
        let bow = 0;
        let broadside = 0;
        let stern = 0;
        this.weaponAlignmentTypes.forEach(alignment => {
            this.weaponsSelection.forEach((amount, id) => {
                if (id.includes(alignment)) {
                    if (EWeaponAlignmentEnum.BOW === alignment) {
                        bow += amount;
                    } else if (EWeaponAlignmentEnum.BROADSIDE === alignment) {
                        broadside += amount;
                    } else if (EWeaponAlignmentEnum.STERN === alignment) {
                        stern += amount;
                    }
                }
            });
        });
        this.weaponAlignmentTypes.forEach(alignment => {
            if (EWeaponAlignmentEnum.BOW === alignment) {
                event.set(alignment, bow);
            } else if (EWeaponAlignmentEnum.BROADSIDE === alignment) {
                event.set(alignment, broadside);
            } else if (EWeaponAlignmentEnum.STERN === alignment) {
                event.set(alignment, stern);
            }
        });
        let ifChanged = this.checkIfChanged(event);
        if (ifChanged) {
            // if changed, notify the svg component to re-render the slots
            this.weaponsAmountByAlignmentOutput.emit(event);
        }
    }

    createAndEmitDesignedShipClass() {
        const weapons: AlignedFitting[] = [];
        const ammo: AmmunitionFitting[] = [];
        const passives: SupportFitting[] = [];

        this.mapMultiModulesToFitting(weapons, ammo, passives);
        let output: ShipClassMock = {
            shipClassType: this.shipClassTypeSelection,
            fittings: weapons,
            ammunitionFittings: ammo,
            supportFittings: passives,
            armor: this.armorSelection,
            electronicWarfare: this.elokaSelection,
            propulsion: this.propulsionSelection!,
            sidewall: this.sidewallSelection
        };
        this.shipClassMock = output;
        if (ShipClassValidator.hasPayload(output)) {
            this.fetchPropulsionCapacity(this.shipClassMock);
            this.shipClassMockEmitter.emit(output);
        }
    }

    mapMultiModulesToFitting(weapons: AlignedFitting[],
                             ammo: AmmunitionFitting[],
                             passives: SupportFitting[]) {
        this.weapons.forEach(module => {
            let amountByAlignment: Map<AlignedFitting.WeaponAlignmentEnum, number> = this.getWeaponModuleAmount(module);
            amountByAlignment.forEach((amount, key) => {
                if (!!amount && amount > 0) {
                    let alignment: EWeaponAlignmentEnum = key as keyof typeof AlignedFitting.WeaponAlignmentEnum;
                    weapons.push({
                        amount: amount,
                        weapon: module,
                        weaponAlignment: alignment
                    });
                }
            });
        });
        this.launchers.forEach(module => {
            let amountByAlignment: Map<AlignedFitting.WeaponAlignmentEnum, number> = this.getWeaponModuleAmount(module);
            amountByAlignment.forEach((amount, key) => {
                if (!!amount && amount > 0) {
                    let alignment: EWeaponAlignmentEnum = key as keyof typeof AlignedFitting.WeaponAlignmentEnum;
                    weapons.push({
                        amount: amount,
                        launcher: module,
                        weaponAlignment: alignment
                    });
                }
            });
        });

        this.ammoSelection.forEach((amount, key) => {
            if (!!amount && amount > 0) {
                let id: number = FittingHelper.getAmmunitionIdFromKey(key);
                const missile = this.missiles.filter(m => m.baseModule.idModule === id)[0];
                ammo.push({
                    amount: amount,
                    missile: missile
                });
            }
        });

        this.passiveModules.forEach(module => {
            let amount = this.getPassiveModuleAmount(module);
            if (!!amount && amount > 0) {
                passives.push({
                    passiveModule: module,
                    amount: amount,
                });
            }
        });
    }

    setAmmunitionModule(missile?: Missile, amount?: number) {
        if (!!missile && !!amount) {
            let id: string = FittingHelper.getAmmunitionMapKey(missile);
            this.ammoSelection.set(id, amount);
            this.createAndEmitDesignedShipClass();
        }
    }

    getMissileAmount(missile?: Missile): number {
        if (!missile) {
            return 0;
        }
        let id: string = FittingHelper.getAmmunitionMapKey(missile);
        let amount = this.ammoSelection.get(id);
        if (!amount) {
            amount = 0;
        }
        return amount;
    }

    setPassiveModule(passive: PassiveModule, amount: number) {
        let id: string = FittingHelper.getPassiveMapKey(passive);
        this.supportSelection.set(id, amount);
    }

    getPassiveModuleAmount(passive?: PassiveModule): number {
        if (!passive) {
            return 0;
        }
        let id: string = FittingHelper.getPassiveMapKey(passive);
        let amount = this.supportSelection.get(id);
        if (!amount) {
            amount = 0;
        }
        return amount;
    }

    selectWeaponType(type: EWeaponTypeEnum) {
        this.selectedWeaponType = type;
        this.setWeaponDescription();
        this.filterDisplayedItems();
    }

    private setWeaponDescription() {
        const desc = this.weaponsDescriptions.get(this.selectedWeaponType);
        this.weaponsDescription = !!desc ? desc : '';
    }

    selectTechnologyType(type: TechnologyTypeEnum) {
        this.selectedTechnologyType = type;
        this.filterDisplayedItems();
    }

    selectHyperband(type: HyperBandEnum) {
        this.selectedHyperband = type;
        this.selectPropulsion();
    }

    private selectPropulsion() {
        this.propulsionSelection = this.filteredPropulsions.filter(p => this.propulsionMatchesConditions(p))[0];
        this.change.detectChanges();
        this.createAndEmitDesignedShipClass();
    }

    chooseWeapon(weapon?: Weapon | Launcher) {
        this.selectedWeapon = weapon;
        this.hoverWeapon(weapon);
    }

    hoverWeapon(weapon?: Weapon | Launcher) {
        this.hoveredWeapon = weapon;
        if (!weapon && !!this.selectedWeapon) {
            this.hoveredWeapon = this.selectedWeapon;
        }

        const oldLoadout = this.missileLoadout.map(m => m);
        this.missileLoadout = this.getMissilesOfLoadout(this.shipClassMock); /* todo testen ob entfernte launcher auch alle "ihre" mun entfernen */
        oldLoadout.filter(known => this.missileLoadout.filter(m => m.baseModule.idModule === known.baseModule.idModule).length === 0).forEach(missile => this.setAmmunitionModule(missile, 0));
    }

    isFilteredModule<MODULE extends { baseModule: BaseModule }>(module: MODULE, filteredModules: MODULE[]) {
        // workaround to hide options because on adding options to the list the selected element will be the last in the list -> the new one
        const isFiltered = filteredModules.filter(fh => fh.baseModule.idModule === module.baseModule.idModule).length > 0;
        if ('weaponType' in module) {
            // noinspection UnnecessaryLocalVariableJS
            const excludedByWeaponType = !!this.selectedWeaponType && this.selectedWeaponType === <WeaponTypeEnum>module.weaponType;
            return excludedByWeaponType;
        }
        return isFiltered;
    }

    fetchPropulsionCapacity(shipClass?: ShipClass | ShipClassMock) {
        if (!shipClass || !this.propulsionSelection) {
            this.propulsionCapacity = [];
            return;
        }
        const pseudoHash = ShipClassHelper.generateFittingPseudoHash(shipClass);
        const idPropulsion = this.propulsionSelection.baseModule.idModule;
        const key = pseudoHash + 'p' + idPropulsion;
        const propulsionCapacities = this.propulsionCapacityCache.get(key);
        if (!!propulsionCapacities) {
            this.propulsionCapacity = propulsionCapacities;
            return;
        }
        let sub = this.shipyardApi.getPropulsionCapacity(shipClass, idPropulsion).subscribe(resp => {
            this.propulsionCapacityCache.set(key, resp);
            this.propulsionCapacity = resp;
        })
        this.subscriptions.push(sub);
    }

    getDisplayName<MODULE extends { baseModule: BaseModule }>(module: MODULE) {
        if (!module.baseModule.technicalTypeName) {
            return module.baseModule.name;
        }
        return module.baseModule.name + ", " + module.baseModule.technicalTypeName;
    }

    getMissilesOfLoadout(shipClass?: ShipClass | ShipClassMock): Missile[] {
        if (!shipClass) {
            return [];
        }

        let missiles: Missile[] = [];
        shipClass.fittings.filter(f => !!f.launcher).map(f => f.launcher!.allowedMissiles).forEach(toAdd => {
            toAdd.forEach(missile => {
                if (missiles.filter(known => known.baseModule.idModule === missile.baseModule.idModule).length === 0) {
                    missiles.push(missile);
                }
            });
        });
        return missiles;
    }

    getAmountOfLaunchersFor(missile: Missile, shipClass?: ShipClass | ShipClassMock) {
        let counter = 0;
        if (!shipClass) {
            return counter;
        }
        shipClass.fittings.filter(f => !!f.launcher).forEach(f => {
            const missiles = f.launcher!.allowedMissiles;
            missiles.forEach(toCheck => {
                if (missile.baseModule.idModule === toCheck.baseModule.idModule) {
                    counter += f.amount;
                }
            });
        });
        return counter;
    }

    getMissileTonnage(missile: Missile): Mass {
        const missileAmount = this.getMissileAmount(missile);
        return {coordinate: missile.baseModule.tonnage!.coordinate * missileAmount, massMetric: missile.baseModule.tonnage!.massMetric};
    }
}
