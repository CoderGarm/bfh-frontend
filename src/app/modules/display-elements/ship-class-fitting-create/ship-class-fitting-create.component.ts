import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {
    AlignedFitting,
    AmmunitionFitting,
    AmmunitionModule,
    Armor,
    ElectronicWarfare,
    Hull,
    Launcher,
    PassiveModule,
    Propulsion,
    ShipClass,
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

@Component({
    selector: 'app-ship-class-fitting-create',
    templateUrl: './ship-class-fitting-create.component.html',
    styleUrls: ['./ship-class-fitting-create.component.scss']
})
export class ShipClassFittingCreateComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    /**w
     * the ship class which should be displayed
     */
    @Input()
    shipClassInput?: ShipClass;
    shipClassInputDefinition: string = "shipClassInput";

    /**
     * emits the least changes in the given ship class
     */
    @Input()
    designedShipClassInputEmitter?: EventEmitter<ShipClass>;

    /**
     * emits the least changes in the given ship class
     */
    @Output()
    weaponsAmountByAlignmentOutput: EventEmitter<Map<AlignedFitting.WeaponAlignmentEnum, number>> = new EventEmitter<Map<AlignedFitting.WeaponAlignmentEnum, number>>();

    /**
     * the displayed ship class name
     */
    @Input()
    shipClassNameInput?: string;

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
    propulsionSelection?: Propulsion;
    armorSelection?: Armor;
    sidewallsSelection?: Sidewall;
    elokaSelection?: ElectronicWarfare;

    filteredWeapons: Weapon[] = [];
    filteredLaunchers: Launcher[] = [];
    filteredMunitions: AmmunitionModule[] = [];
    filteredPassiveModules: PassiveModule[] = [];

    filteredArmors: Armor[] = [];
    filteredSidewalls: Sidewall[] = [];
    filteredEloka: ElectronicWarfare[] = [];
    filteredPropulsions: Propulsion[] = [];
    filteredHulls: Hull[] = [];
    eHullTypeChipValues: ChipSelectorValue[] = [];
    hoveredHull?: Hull;

    /**
     * the 'should I redraw the weapon slots' validation map to hold the already known values
     * @private
     */
    private validatorMap: Map<AlignedFitting.WeaponAlignmentEnum, number> = new Map<AlignedFitting.WeaponAlignmentEnum, number>();

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

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.shipClassInputDefinition]) {
            this.setShipClass();
        }
    }

    filterDisplayedItems(chips: ChipSelectorValueResult[]) {
        const selectedTypeNames: string[] = chips.filter(c => c.selected).map(c => c.chipValue);

        this.launchers.filter(module => {
            const typeName = module.baseModule.hullType.typeName;

            let id = FittingHelper.getWeaponSystemMapKey(module);
            let moduleSelected: boolean = false;
            this.weaponsSelection.forEach((value, key) => {
                if (value > 0 && key.startsWith(id)) {
                    moduleSelected = true;
                }
            });

            const matchedSelectedHull = !!this.hullSelection && this.hullSelection.hullType.typeName === module.baseModule.hullType.typeName;
            if (selectedTypeNames.includes(typeName) || matchedSelectedHull || moduleSelected) {
                if (this.filteredLaunchers.filter(h => h.baseModule.hullType.typeName === typeName).length == 0) {
                    this.filteredLaunchers.push(module);
                }
            } else {
                const indexOf = this.filteredLaunchers.indexOf(module);
                if (indexOf != -1) {
                    this.filteredLaunchers.splice(indexOf, 1);
                }
            }
        });

        this.weapons.filter(module => {
            const typeName = module.baseModule.hullType.typeName;

            let id = FittingHelper.getWeaponSystemMapKey(module);
            let moduleSelected: boolean = false;
            this.weaponsSelection.forEach((value, key) => {
                if (value > 0 && key.startsWith(id)) {
                    moduleSelected = true;
                }
            });

            const matchedSelectedHull = !!this.hullSelection && this.hullSelection.hullType.typeName === module.baseModule.hullType.typeName;
            if (selectedTypeNames.includes(typeName) || matchedSelectedHull || moduleSelected) {
                if (this.filteredWeapons.filter(h => h.baseModule.hullType.typeName === typeName).length == 0) {
                    this.filteredWeapons.push(module);
                }
            } else {
                const indexOf = this.filteredWeapons.indexOf(module);
                if (indexOf != -1) {
                    this.filteredWeapons.splice(indexOf, 1);
                }
            }
        });

        this.armors.filter(module => {
            const typeName = module.baseModule.hullType.typeName;
            const matchedSelectedHull = !!this.hullSelection && this.hullSelection.hullType.typeName === module.baseModule.hullType.typeName;
            const moduleSelected = !!this.armorSelection && this.armorSelection.baseModule.idModule === module.baseModule.idModule;
            if (selectedTypeNames.includes(typeName) || matchedSelectedHull || moduleSelected) {
                if (this.filteredArmors.filter(h => h.baseModule.hullType.typeName === typeName).length == 0) {
                    this.filteredArmors.push(module);
                }
            } else {
                const indexOf = this.filteredArmors.indexOf(module);
                if (indexOf != -1) {
                    this.filteredArmors.splice(indexOf, 1);
                }
            }
        });

        this.sidewalls.filter(module => {
            const typeName = module.baseModule.hullType.typeName;
            const matchedSelectedHull = !!this.hullSelection && this.hullSelection.hullType.typeName === module.baseModule.hullType.typeName;
            const moduleSelected = !!this.sidewallsSelection && this.sidewallsSelection.baseModule.idModule === module.baseModule.idModule;
            if (selectedTypeNames.includes(typeName) || matchedSelectedHull || moduleSelected) {
                if (this.filteredSidewalls.filter(h => h.baseModule.hullType.typeName === typeName).length == 0) {
                    this.filteredSidewalls.push(module);
                }
            } else {
                const indexOf = this.filteredSidewalls.indexOf(module);
                if (indexOf != -1) {
                    this.filteredSidewalls.splice(indexOf, 1);
                }
            }
        });

        this.eloka.filter(module => {
            const typeName = module.baseModule.hullType.typeName;
            const matchedSelectedHull = !!this.hullSelection && this.hullSelection.hullType.typeName === module.baseModule.hullType.typeName;
            const moduleSelected = !!this.elokaSelection && this.elokaSelection.baseModule.idModule === module.baseModule.idModule;
            if (selectedTypeNames.includes(typeName) || matchedSelectedHull || moduleSelected) {
                if (this.filteredEloka.filter(h => h.baseModule.hullType.typeName === typeName).length == 0) {
                    this.filteredEloka.push(module);
                }
            } else {
                const indexOf = this.filteredEloka.indexOf(module);
                if (indexOf != -1) {
                    this.filteredEloka.splice(indexOf, 1);
                }
            }
        });

        this.propulsions.filter(module => {
            const typeName = module.baseModule.hullType.typeName;
            const matchedSelectedHull = !!this.hullSelection && this.hullSelection.hullType.typeName === module.baseModule.hullType.typeName;
            const moduleSelected = !!this.propulsionSelection && this.propulsionSelection.baseModule.idModule === module.baseModule.idModule;
            if (selectedTypeNames.includes(typeName) || matchedSelectedHull || moduleSelected) {
                if (this.filteredPropulsions.filter(h => h.baseModule.hullType.typeName === typeName).length == 0) {
                    this.filteredPropulsions.push(module);
                }
            } else {
                const indexOf = this.filteredPropulsions.indexOf(module);
                if (indexOf != -1) {
                    this.filteredPropulsions.splice(indexOf, 1);
                }
            }
        });

        this.hulls.filter(hull => {
            const matchedSelectedHull = !!this.hullSelection && this.hullSelection.hullType.typeName === hull.hullType.typeName;
            if (selectedTypeNames.includes(hull.hullType.typeName) || matchedSelectedHull) {
                if (this.filteredHulls.filter(h => h.hullType.typeName === hull.hullType.typeName).length == 0) {
                    this.filteredHulls.push(hull);
                }
            } else {
                const indexOf = this.filteredHulls.indexOf(hull);
                if (indexOf != -1) {
                    this.filteredHulls.splice(indexOf, 1);
                }
            }
        });
        console.log(this.filteredHulls)
    }

    /**
     * sets the ship class from the input to the view
     * @private
     */
    private setShipClass() {
        let shipClass = this.shipClassInput;
        // clear the selection
        this.clearAllFittings();
        if (!!shipClass) {
            this.chooseHull(shipClass.hull);
            this.chooseArmor(shipClass.armor);
            this.chooseEloka(shipClass.electronicWarfare);
            this.choosePropulsion(shipClass.propulsion);
            this.chooseSidewall(shipClass.sidewall);

            // set ammunition fittings
            let ammunitionFittings = shipClass.ammunitionFittings;
            ammunitionFittings.forEach(ammo => this.setAmmunitionModule(ammo.ammunitionModule, ammo.amount));
            // set fittings
            if (!!shipClass.fittings) {
                let fittings = shipClass.fittings;

                let weaponSelectionMap: Map<String, WeaponsSelection> = new Map<String, WeaponsSelection>();
                fittings.forEach(fitting => {
                    let weapon: Weapon | Launcher | undefined = fitting.weapon || fitting.launcher;
                    if (!weapon) {
                        return;
                    }
                    let weaponKey = FittingHelper.getWeaponSystemMapKey(weapon, undefined);
                    let selection: WeaponsSelection | undefined = weaponSelectionMap.get(weaponKey);
                    if (!selection) {
                        let amountByAlignmentMap = new Map<AlignedFitting.WeaponAlignmentEnum, number>();
                        selection = {
                            weapon: weapon,
                            weaponAmountPerAlignment: amountByAlignmentMap!
                        }
                        weaponSelectionMap.set(weaponKey, selection);
                    }
                    let alignment = fitting.weaponAlignment as keyof typeof AlignedFitting.WeaponAlignmentEnum;
                    selection.weaponAmountPerAlignment.set(alignment, fitting.amount);

                    if (!!ammunitionFittings && WeaponHelper.isLauncher(weapon)) {
                        // match ammunition with weapons
                        let ammoFittingForWeapon: AmmunitionFitting[] = ammunitionFittings
                            .filter(ammo => {
                                if (!!(<Launcher>weapon).ammunitionModule) {
                                    return ammo.ammunitionModule.baseModule.idModule === (<Launcher>weapon).ammunitionModule.baseModule.idModule
                                }
                                return false;
                            });
                        // currently there is only one ammunition type present per weapon
                        ammoFittingForWeapon.forEach(ammo => {
                            if (!!selection) {
                                selection.ammo = ammo.ammunitionModule;
                                selection.ammoAmount = (!!selection.ammoAmount ? selection.ammoAmount : 0) + ammo.amount;
                            }
                        });
                    }
                });
                weaponSelectionMap.forEach((weaponSelection, key) => this.chooseWeapon(weaponSelection));
                // old code end
            }
            if (!!shipClass.supportFittings) {
                shipClass.supportFittings.forEach(fitting => {
                    let passiveModule = fitting.passiveModule;
                    let amount = fitting.amount;
                    this.choosePassiveModule(amount, passiveModule);
                });
            }
        }
        this.createAndEmitDesignedShipClass();
    }

    private clearAllFittings() {
        this.chooseHull(undefined);
        this.chooseArmor(undefined);
        this.chooseEloka(undefined);
        this.choosePropulsion(undefined);
        this.chooseSidewall(undefined);
        this.ammoSelection.clear();
        this.weaponsSelection.clear();
        this.supportSelection.clear();
    }

    /**
     * sets the user selected hull
     * @param hull
     */
    chooseHull(hull?: Hull) {
        this.hullSelection = hull;
        this.hoverHull(hull);
        this.createAndEmitDesignedShipClass();
    }

    /**
     * sets the user selected weapon loadout
     * @param loadout
     */
    chooseWeapon(loadout: WeaponsSelection) {
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

    /**
     * sets the user selected armor
     * @param armor
     */
    chooseArmor(armor?: Armor) {
        this.armorSelection = armor;
        this.createAndEmitDesignedShipClass();
    }

    /**
     * * sets the user selected sidewall
     * @param sidewall
     */
    chooseSidewall(sidewall?: Sidewall) {
        this.sidewallsSelection = sidewall;
        this.createAndEmitDesignedShipClass();
    }

    /**
     * * sets the user selected prop
     * @param propulsion
     */
    choosePropulsion(propulsion?: Propulsion) {
        this.propulsionSelection = propulsion;
        this.createAndEmitDesignedShipClass();
    }

    /**
     * sets the user selected eloka loadout
     * @param eloka
     */
    chooseEloka(eloka?: ElectronicWarfare) {
        this.elokaSelection = eloka;
        this.createAndEmitDesignedShipClass();
    }

    /**
     * sets the user selected passive loadout
     * @param amount
     * @param passive
     */
    choosePassiveModule(amount: number, passive: PassiveModule) {
        this.setPassiveModule(passive, amount);
        this.createAndEmitDesignedShipClass();
    }

    /**
     * returns the weapon selection for the given weapon
     * @param weapon
     */
    getWeaponSelection(weapon: Weapon | Launcher): WeaponsSelection | undefined {
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

    /**
     * returns the positioning for the weapon system
     * @param weapon
     * @private
     */
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

    /**
     * checks if the weapon loadout has changed and must be redrawn
     * @param newData
     * @private
     */
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

    /**
     * sets the weapon selection to the data structure
     * @param weapon
     * @private
     */
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

    /**
     * creates the output data
     * @private
     */
    private createAndEmitDesignedShipClass() {

        if (!this.hullSelection || !this.shipClassNameInput || !this.propulsionSelection) {
            if (!!this.designedShipClassInputEmitter) {
                this.designedShipClassInputEmitter.emit(undefined);
            }
            return;
        }

        let userID = this.tokenStorage.getUserID();
        let role = this.tokenStorage.getRole();
        let username = this.tokenStorage.getLogin();

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

        let output: ShipClass = {
            idShipClass: !!this.shipClassInput ? this.shipClassInput.idShipClass : undefined,
            hull: this.hullSelection!,
            fittings: weapons,
            ammunitionFittings: ammo,
            supportFittings: passives,
            armor: this.armorSelection,
            electronicWarfare: this.elokaSelection,
            propulsion: this.propulsionSelection,
            sidewall: this.sidewallsSelection,
            idPredecessor: !!this.shipClassInput ? this.shipClassInput.idShipClass : undefined,
            idSuccessor: undefined,
            mark: !!this.shipClassInput ? this.shipClassInput.mark : 1,
            name: this.shipClassNameInput!,
            owner: {
                idUser: userID,
                role: role,
                username: username
            },
            shipClassCapabilities: {
                capabilities: []
            },
            spacecraftCapacityAreas: {
                capacityValues: []
            },
            ammunitionState: {
                shotsPerMissile: []
            }
        };
        if (!!this.designedShipClassInputEmitter) {
            this.designedShipClassInputEmitter.emit(output);
        }
    }

    /**
     * sets the ammunition module to the data structure
     * @param ammunitionModule
     * @param amount
     * @private
     */
    private setAmmunitionModule(ammunitionModule: AmmunitionModule, amount: number) {
        let id: string = FittingHelper.getAmmunitionMapKey(ammunitionModule);
        this.ammoSelection.set(id, amount);
    }

    /**
     * returns the amount of the ammo module
     * @param ammunitionModule
     * @private
     */
    private getAmmunitionModuleAmount(ammunitionModule: AmmunitionModule): number {
        let id: string = FittingHelper.getAmmunitionMapKey(ammunitionModule);
        let amount = this.ammoSelection.get(id);
        if (!amount) {
            amount = 0;
        }
        return amount;
    }

    /**
     * sets the passive module to the data structure
     * @param passive
     * @param amount
     * @private
     */
    private setPassiveModule(passive: PassiveModule, amount: number) {
        let id: string = FittingHelper.getPassiveMapKey(passive);
        this.supportSelection.set(id, amount);
    }

    /**
     * returns the amount of passive modules
     * @param passive
     */
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

    isSelected(hull: Hull) {
        // workaround to hide options because on adding options to the list the selected element will be the last in the list -> the new one
        return this.filteredHulls.filter(fh => fh.hullType.typeName === hull.hullType.typeName).length > 0;
    }
}
