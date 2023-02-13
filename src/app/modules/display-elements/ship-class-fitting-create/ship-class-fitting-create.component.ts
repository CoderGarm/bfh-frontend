import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Output} from '@angular/core';
import {
    AlignedFitting,
    AmmunitionFitting,
    AmmunitionModule,
    Armor,
    BaseModule,
    ElectronicWarfare,
    EnumValueDto,
    Hull,
    Launcher,
    PassiveModule,
    Propulsion,
    ShipClassMock,
    Sidewall,
    SupportFitting,
    Weapon
} from "../../../services/swagger";
import {WeaponsSelection} from "../weapons-counter/weapons-counter.component";
import {WeaponHelper} from "../../../services/helper/weapon.helper";
import {ModuleService} from "../../../services/prefetch/module.service";
import {SubscriptionManager} from "../../../subscription.manager";
import {ChipSelectorValue, ChipSelectorValueResult} from "../../shared-module/components/chip-selector/chip-selector.component";
import {FittingHelper} from "../../../services/helper/fitting.helper";
import EWeaponTypeEnum = EnumValueDto.EWeaponTypeEnum;
import EAlignmentTypeEnum = EnumValueDto.EAlignmentTypeEnum;
import EWeaponAlignmentEnum = EnumValueDto.EWeaponAlignmentEnum;

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

    /**
     * the modules to select from
     */
    weapons: Weapon[] = [];
    launchers: Launcher[] = [];
    munitions: AmmunitionModule[] = [];
    armors: Armor[] = [];
    sidewalls: Sidewall[] = [];
    eloka: ElectronicWarfare[] = [];
    passiveModules: PassiveModule[] = [];
    propulsions: Propulsion[] = [];
    hulls: Hull[] = [];

    /**
     * the maps which are holding the user's selections
     */
    weaponsSelection: Map<String, number> = new Map<String, number>();
    ammoSelection: Map<String, number> = new Map<String, number>();
    supportSelection: Map<String, number> = new Map<String, number>();
    /**
     * the single selection items
     */
    hullSelection?: Hull;
    hoveredPropulsion?: Propulsion;
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
    /**
     * currently not needed - will be useful if fleet trains are implemented
     */
    filteredAmmunition: AmmunitionModule[] = [];

    filteredArmors: Armor[] = [];
    filteredSidewalls: Sidewall[] = [];
    filteredEloka: ElectronicWarfare[] = [];
    filteredPropulsions: Propulsion[] = [];
    filteredHulls: Hull[] = [];
    eHullTypeChipValues: ChipSelectorValue[] = [];
    hoveredHull?: Hull;
    hoveredWeapon?: Weapon | Launcher;
    selectedWeapon?: Weapon | Launcher

    /**
     * the 'should I redraw the weapon slots' validation map to hold the already known values
     * @private
     */
    private validatorMap: Map<AlignedFitting.WeaponAlignmentEnum, number> = new Map<AlignedFitting.WeaponAlignmentEnum, number>();

    capAreas: EAlignmentTypeEnum[] = [EAlignmentTypeEnum.CHASEALIGNMENT, EAlignmentTypeEnum.BATTLEALIGNMENT];

    weaponTypes: EWeaponTypeEnum[] = [EWeaponTypeEnum.MISSILE, EWeaponTypeEnum.BEAM, EWeaponTypeEnum.COUNTERMISSILE, EWeaponTypeEnum.POINTDEFENSE]
    selectedWeaponType: EWeaponTypeEnum = EWeaponTypeEnum.MISSILE;
    selectedArc: EAlignmentTypeEnum = EAlignmentTypeEnum.BATTLEALIGNMENT;

    private chips: ChipSelectorValueResult[] = [];

    constructor(private moduleApi: ModuleService,
                private change: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit(): void {
        let sub = this.moduleApi.getWeaponsByUser().subscribe(resp => this.weapons = resp);
        this.subscriptions.push(sub);
        sub = this.moduleApi.getLaunchersByUser().subscribe(resp => this.launchers = resp);
        this.subscriptions.push(sub);
        sub = this.moduleApi.getArmorsByUser().subscribe(resp => this.armors = resp);
        this.subscriptions.push(sub);
        sub = this.moduleApi.getSidewallsByUser().subscribe(resp => this.sidewalls = resp);
        this.subscriptions.push(sub);
        sub = this.moduleApi.getElectronicWarfareByUser().subscribe(resp => this.eloka = resp);
        this.subscriptions.push(sub);
        sub = this.moduleApi.getAmmunitionModulesByUser().subscribe(resp => this.munitions = resp);
        this.subscriptions.push(sub);
        sub = this.moduleApi.getPropulsionsByUser().subscribe(resp => this.propulsions = resp);
        this.subscriptions.push(sub);
        sub = this.moduleApi.getPassiveModulesByUser().subscribe(resp => this.passiveModules = resp);
        this.subscriptions.push(sub);
        sub = this.moduleApi.getHullsByUser().subscribe(resp => {
            this.hulls = resp;
            this.eHullTypeChipValues = [];
            this.hulls.map(hull => ({value: hull.hullType.type})).forEach(ht => {
                if (this.eHullTypeChipValues.filter(t => t.value === ht.value).length === 0) {
                    this.eHullTypeChipValues.push(ht);
                }
            });
        });
        this.subscriptions.push(sub);
        this.change.detectChanges();
    }

    filterDisplayedItems(chips?: ChipSelectorValueResult[]) {
        if (!chips) {
            chips = this.chips;
        } else {
            this.chips = chips;
        }
        const selectedTypeNames: string[] = chips.filter(c => c.selected).map(c => c.chipValue);

        this.passiveModules.filter(module => this.addOrRemoveMultiSelectionModule(selectedTypeNames, module, this.filteredPassiveModules, this.supportSelection));
        this.munitions.filter(module => this.addOrRemoveMultiSelectionModule(selectedTypeNames, module, this.filteredAmmunition, this.ammoSelection));
        this.launchers.filter(module => this.addOrRemoveMultiSelectionModule(selectedTypeNames, module, this.filteredLaunchers, this.weaponsSelection));
        this.weapons.filter(module => this.addOrRemoveMultiSelectionModule(selectedTypeNames, module, this.filteredWeapons, this.weaponsSelection));

        this.armors.filter(module => this.addOrRemoveSingleSelectModule(selectedTypeNames, module, this.filteredArmors, this.armorSelection));
        this.sidewalls.filter(module => this.addOrRemoveSingleSelectModule(selectedTypeNames, module, this.filteredSidewalls, this.sidewallSelection));
        this.eloka.filter(module => this.addOrRemoveSingleSelectModule(selectedTypeNames, module, this.filteredEloka, this.elokaSelection));
        this.propulsions.filter(module => this.addOrRemoveSingleSelectModule(selectedTypeNames, module, this.filteredPropulsions, this.propulsionSelection));

        this.hulls.filter(hull => {
            const matchedSelectedHull = !!this.hullSelection && this.hullSelection.hullType.typeName === hull.hullType.typeName;
            if (selectedTypeNames.includes(hull.hullType.typeName) || matchedSelectedHull) {
                if (this.filteredHulls.filter(h => h.hullType.typeName === hull.hullType.typeName).length == 0) {
                    this.filteredHulls.push(hull);
                }
            } else {
                this.removeIfPresent(this.filteredHulls, hull);
            }
        });
        this.change.detectChanges();
    }

    private addOrRemoveMultiSelectionModule<MODULE extends Weapon | Launcher | PassiveModule | AmmunitionModule>(selectedTypeNames: string[],
                                                                                                                 module: MODULE,
                                                                                                                 elements: MODULE[],
                                                                                                                 selected: Map<String, number>) {
        const typeName = module.baseModule.hullType.typeName;

        let selectedByFilter: boolean = true;
        let id: string;
        if ('supportType' in module) {
            id = FittingHelper.getPassiveMapKey(module);
        } else if ('missile' in module) {
            id = FittingHelper.getAmmunitionMapKey(module);
        } else {
            id = FittingHelper.getWeaponSystemMapKey(module);
            const weapon = <Weapon | Launcher>module;
            if (this.selectedWeaponType != weapon.weaponType) {
                selectedByFilter = false;
            }
            if (!!this.selectedArc) {
                const alignmentTypes = weapon.alignmentTypes;
                switch (this.selectedArc) {
                    case "CHASE_ALIGNMENT":
                        if (!alignmentTypes.includes(EWeaponAlignmentEnum.BOW) || !alignmentTypes.includes(EWeaponAlignmentEnum.STERN)) {
                            selectedByFilter = false;
                        }
                        break;
                    case "BATTLE_ALIGNMENT":
                        if (!alignmentTypes.includes(EWeaponAlignmentEnum.BROADSIDE)) {
                            selectedByFilter = false;
                        }
                        break;
                    default:
                        break;
                }
            }
        }

        let moduleSelected: boolean = false;
        selected.forEach((value, key) => {
            if (value > 0 && key.startsWith(id)) {
                moduleSelected = true;
            }
        });

        const matchedSelectedHull = !!this.hullSelection && this.hullSelection.hullType.typeName === module.baseModule.hullType.typeName;
        if (selectedByFilter && (selectedTypeNames.includes(typeName) || matchedSelectedHull || moduleSelected)) {
            if (elements.filter(h => h.baseModule.hullType.typeName === typeName).length == 0) {
                elements.push(module);
            }
        } else {
            this.removeIfPresent(elements, module);
        }
    }

    private addOrRemoveSingleSelectModule<MODULE extends { baseModule: BaseModule }>(selectedTypeNames: string[], module: MODULE, elements: MODULE[], selection: MODULE | undefined) {
        if (this.isPushCandidate(selectedTypeNames, module, selection)) {
            if (elements.filter(h => h.baseModule.hullType.typeName === module.baseModule.hullType.typeName).length == 0) {
                elements.push(module);
            }
        } else {
            this.removeIfPresent(elements, module);
        }
    }

    private removeIfPresent<MODULE>(elements: MODULE[], module: MODULE) {
        const indexOf = elements.indexOf(module);
        if (indexOf != -1) {
            elements.splice(indexOf, 1);
        }
    }

    private isPushCandidate<MODULE extends { baseModule: BaseModule }>(selectedTypeNames: string[], candidate: MODULE, selection: MODULE | undefined) {
        const baseModule: BaseModule = candidate.baseModule;
        const typeName = baseModule.hullType.typeName;
        const matchedSelectedHull = !!this.hullSelection && this.hullSelection.hullType.typeName === baseModule.hullType.typeName;
        const moduleSelected = !!selection && selection.baseModule.idModule === baseModule.idModule;
        return selectedTypeNames.includes(typeName) || matchedSelectedHull || moduleSelected;
    }

    chooseHull(hull?: Hull) {
        this.hullSelection = hull;
        this.hoverHull(hull);
        this.createAndEmitDesignedShipClass();
    }

    updateWeaponSelection(loadout: WeaponsSelection) {
        this.setWeaponModule(loadout);
        let hasAmmoModule = !!loadout.ammo;
        let hasAmmoAmount = !!loadout.ammoAmount;
        let hasNoAmmoAmount = !hasAmmoAmount || loadout.ammoAmount == 0;
        if (hasAmmoModule && hasNoAmmoAmount) {
            let ammoAmount = this.getAmmunitionModuleAmount(loadout!.ammo!);
            if (ammoAmount != loadout.ammoAmount) {
                this.setAmmunitionModule(loadout!.ammo!, ammoAmount);
            }
        } else {
            if (hasAmmoModule && hasAmmoAmount) {
                this.setAmmunitionModule(loadout!.ammo!, loadout!.ammoAmount!);
            }
        }
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
            let isLauncher = WeaponHelper.isLauncher(weapon);
            if (isLauncher) {
                let ammoModule = (<Launcher>weapon).ammunitionModule;
                if (!!ammoModule) {
                    let inBetweenAmmoAmount = this.getAmmunitionModuleAmount(ammoModule);
                    if (!!inBetweenAmmoAmount) {
                        ammoAmount = inBetweenAmmoAmount;
                    }
                    w.ammo = ammoModule;
                    w.ammoAmount = ammoAmount;
                }
            }
            return w;
        }
        return undefined;
    }

    private getWeaponModuleAmount(weapon: Weapon | Launcher): Map<AlignedFitting.WeaponAlignmentEnum, number> {
        let map = new Map<AlignedFitting.WeaponAlignmentEnum, number>();
        weapon.alignmentTypes.forEach(key => {
            let alignment = key as keyof typeof AlignedFitting.WeaponAlignmentEnum;
            let id = FittingHelper.getWeaponSystemMapKey(weapon, alignment);
            let amount = this.weaponsSelection.get(id);
            if (!amount) {
                amount = 0;
            }
            map.set(alignment, amount);
        });
        return map;
    }

    private checkIfChanged(newData: Map<AlignedFitting.WeaponAlignmentEnum, number>): boolean {
        let result: boolean = false;
        Object.keys(AlignedFitting.WeaponAlignmentEnum).forEach(key => {
            let alignment = key as keyof typeof AlignedFitting.WeaponAlignmentEnum;
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

    private setWeaponModule(weapon: WeaponsSelection) {
        let event: Map<AlignedFitting.WeaponAlignmentEnum, number> = new Map<AlignedFitting.WeaponAlignmentEnum, number>();
        weapon.weapon.alignmentTypes.forEach(key => {
            // set the current selection to data structure
            let alignment = key as keyof typeof AlignedFitting.WeaponAlignmentEnum;
            let amount = weapon.weaponAmountPerAlignment.get(alignment);
            if (!amount) {
                amount = 0;
            }
            let id: string = FittingHelper.getWeaponSystemMapKey(weapon.weapon, alignment);
            this.weaponsSelection.set(id, amount);
        });
        let bow = 0;
        let broadside = 0;
        let stern = 0;
        Object.keys(AlignedFitting.WeaponAlignmentEnum).forEach(key => {
            let alignment = key as keyof typeof AlignedFitting.WeaponAlignmentEnum;
            this.weaponsSelection.forEach((amount, id) => {
                if (id.includes(alignment)) {
                    if (AlignedFitting.WeaponAlignmentEnum.BOW === alignment) {
                        bow += amount;
                    } else if (AlignedFitting.WeaponAlignmentEnum.BROADSIDE === alignment) {
                        broadside += amount;
                    } else if (AlignedFitting.WeaponAlignmentEnum.STERN === alignment) {
                        stern += amount;
                    }
                }
            });
        });
        Object.keys(AlignedFitting.WeaponAlignmentEnum).forEach(key => {
            let alignment = key as keyof typeof AlignedFitting.WeaponAlignmentEnum;
            if (AlignedFitting.WeaponAlignmentEnum.BOW === alignment) {
                event.set(alignment, bow);
            } else if (AlignedFitting.WeaponAlignmentEnum.BROADSIDE === alignment) {
                event.set(alignment, broadside);
            } else if (AlignedFitting.WeaponAlignmentEnum.STERN === alignment) {
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

        // maps weapons to the output
        const weapons: AlignedFitting[] = [];
        this.weapons.forEach(module => {
            let amountByAlignment: Map<AlignedFitting.WeaponAlignmentEnum, number> = this.getWeaponModuleAmount(module);
            amountByAlignment.forEach((amount, key) => {
                let alignment = key as keyof typeof AlignedFitting.WeaponAlignmentEnum;
                let s: AlignedFitting = {
                    amount: amount,
                    weapon: module,
                    weaponAlignment: alignment

                }
                if (amount > 0) {
                    weapons.push(s);
                }
            });
        });
        this.launchers.forEach(module => {
            let amountByAlignment: Map<AlignedFitting.WeaponAlignmentEnum, number> = this.getWeaponModuleAmount(module);
            amountByAlignment.forEach((amount, key) => {
                let alignment = key as keyof typeof AlignedFitting.WeaponAlignmentEnum;
                let s: AlignedFitting = {
                    amount: amount,
                    launcher: module,
                    weaponAlignment: alignment

                }
                if (amount > 0) {
                    weapons.push(s);
                }
            });
        });

        // maps the ammunition to the output
        const ammo: AmmunitionFitting[] = [];
        this.munitions.forEach(module => {
            let amount = this.getAmmunitionModuleAmount(module);
            if (!!amount && amount > 0) {
                let s: AmmunitionFitting = {
                    ammunitionModule: module,
                    amount: amount,
                }
                ammo.push(s);
            }
        });

        // maps the supports to the output
        const passives: SupportFitting[] = [];
        this.passiveModules.forEach(module => {
            let amount = this.getPassiveModuleAmount(module);
            if (!!amount && amount > 0) {
                let s: SupportFitting = {
                    passiveModule: module,
                    amount: amount,
                }
                passives.push(s);
            }
        });

        let output: ShipClassMock = {
            hull: this.hullSelection,
            fittings: weapons,
            ammunitionFittings: ammo,
            supportFittings: passives,
            armor: this.armorSelection,
            electronicWarfare: this.elokaSelection,
            propulsion: this.propulsionSelection,
            sidewall: this.sidewallSelection
        };
        this.shipClassMockEmitter.emit(output);
    }

    private setAmmunitionModule(ammunitionModule: AmmunitionModule, amount: number) {
        let id: string = FittingHelper.getAmmunitionMapKey(ammunitionModule);
        this.ammoSelection.set(id, amount);
    }

    private getAmmunitionModuleAmount(ammunitionModule: AmmunitionModule): number {
        let id: string = FittingHelper.getAmmunitionMapKey(ammunitionModule);
        let amount = this.ammoSelection.get(id);
        if (!amount) {
            amount = 0;
        }
        return amount;
    }

    private setPassiveModule(passive: PassiveModule, amount: number) {
        let id: string = FittingHelper.getPassiveMapKey(passive);
        this.supportSelection.set(id, amount);
    }

    getPassiveModuleAmount(passive: PassiveModule): number {
        let id: string = FittingHelper.getPassiveMapKey(passive);
        let amount = this.supportSelection.get(id);
        if (!amount) {
            amount = 0;
        }
        return amount;
    }

    hoverHull(hull?: Hull) {
        this.hoveredHull = hull;
        if (!hull && !!this.hullSelection) {
            this.hoveredHull = this.hullSelection;
        }
    }

    isFiltered(element: Hull) {
        // workaround to hide options because on adding options to the list the selected element will be the last in the list -> the new one
        return this.filteredHulls.filter(fh => fh.hullType.typeName === element.hullType.typeName).length > 0;
    }

    selectWeaponType(type: EWeaponTypeEnum) {
        this.selectedWeaponType = type;
        this.filterDisplayedItems();
    }

    selectFiringArc(arc: EAlignmentTypeEnum) {
        this.selectedArc = arc;
        this.filterDisplayedItems();
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
    }

    isFilteredModule<MODULE extends { baseModule: BaseModule }>(module: MODULE, filteredModules: MODULE[]) {
        // workaround to hide options because on adding options to the list the selected element will be the last in the list -> the new one
        return filteredModules.filter(fh => fh.baseModule.idModule === module.baseModule.idModule).length > 0;
    }
}
