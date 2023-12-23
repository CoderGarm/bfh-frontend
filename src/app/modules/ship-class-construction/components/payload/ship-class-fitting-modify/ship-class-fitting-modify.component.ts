import {
    AlignedFitting,
    AmmunitionFitting,
    Armor,
    ElectronicWarfare,
    EShipClassType,
    Launcher,
    PassiveModule,
    Propulsion,
    ShipClass,
    Sidewall,
    SupportFitting,
    Weapon
} from "../../../../../services/swagger";
import {ShipClassFittingCreateComponent} from "../ship-class-fitting-create/ship-class-fitting-create.component";
import {AfterViewInit, Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {FittingHelper} from "../../../../../services/helper/fitting.helper";
import {WeaponsSelection} from "../../../../display-elements/weapon-per-alingment-counter/weapon-per-alignment-counter.component";
import {ShipClassComparator} from "../ship-class.comparator";

@Component({
    selector: 'app-ship-class-fitting-modify',
    templateUrl: './ship-class-fitting-modify.component.html',
    styleUrls: ['./ship-class-fitting-modify.component.scss']
})
export class ShipClassFittingModifyComponent extends ShipClassFittingCreateComponent implements AfterViewInit {

    @Input()
    shipClass?: ShipClass;
    shipClassDefinition: string = "shipClass";

    @Output()
    shipClassEmitter: EventEmitter<ShipClass> = new EventEmitter<ShipClass>();

    designedShipClass?: ShipClass;
    compareClass?: ShipClass;

    ngAfterViewInit(): void {
        this.change.detectChanges();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.shipClassDefinition]) {
            this.setShipClass();
        }
    }

    private setShipClass() {
        let shipClass = this.shipClass;
        this.clearAllFittings();
        if (!!shipClass) {
            this.chooseShipClassType(shipClass.shipClassType);
            this.chooseArmor(shipClass.armor);
            this.chooseEloka(shipClass.electronicWarfare);
            this.choosePropulsion(shipClass.propulsion);
            this.selectedHyperband = this.propulsionSelection!.hyperBand;
            this.selectedTechnologyType = this.propulsionSelection!.technologyType;
            this.chooseSidewall(shipClass.sidewall);

            // set ammunition fittings
            let ammunitionFittings = shipClass.ammunitionFittings;
            ammunitionFittings.forEach(ammo => this.setAmmunitionModule(ammo.missile, ammo.amount));
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
                });
                weaponSelectionMap.forEach((weaponSelection) => this.updateWeaponSelection(weaponSelection));
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
        this.designedShipClass = shipClass;
        this.createAndEmitDesignedShipClass();
        this.change.detectChanges();
    }

    private clearAllFittings() {
        this.chooseShipClassType(undefined);
        this.chooseArmor(undefined);
        this.chooseEloka(undefined);
        this.choosePropulsion(undefined);
        this.chooseSidewall(undefined);
        this.ammoSelection.clear();
        this.weaponsSelection.clear();
        this.supportSelection.clear();
    }

    chooseShipClassType(shipClassType?: EShipClassType) {
        this.shipClassTypeSelection = shipClassType;
        this.createAndEmitDesignedShipClass();
    }

    chooseArmor(armor?: Armor) {
        this.armorSelection = armor;
        this.createAndEmitDesignedShipClass();
    }

    chooseSidewall(sidewall?: Sidewall) {
        this.sidewallSelection = sidewall;
        this.createAndEmitDesignedShipClass();
    }

    choosePropulsion(propulsion?: Propulsion) {
        this.propulsionSelection = propulsion;
        this.createAndEmitDesignedShipClass();
    }

    chooseEloka(eloka?: ElectronicWarfare) {
        this.elokaSelection = eloka;
        this.createAndEmitDesignedShipClass();
    }

    choosePassiveModule(amount: number, passive?: PassiveModule) {
        if (!passive) {
            return;
        }
        this.setPassiveModule(passive, amount);
        this.createAndEmitDesignedShipClass();
    }

    createAndEmitDesignedShipClass() {
        let userID = this.tokenStorage.getUserID();
        let role = this.tokenStorage.getRole();
        let username = this.tokenStorage.getLogin();

        const weapons: AlignedFitting[] = [];
        const ammo: AmmunitionFitting[] = [];
        const passives: SupportFitting[] = [];

        this.mapMultiModulesToFitting(weapons, ammo, passives);
        let output: ShipClass = {
            shipClassType: this.shipClassTypeSelection!,
            fittings: weapons,
            ammunitionFittings: ammo,
            supportFittings: passives,
            armor: this.armorSelection,
            electronicWarfare: this.elokaSelection,
            propulsion: this.propulsionSelection!,
            sidewall: this.sidewallSelection,
            idPredecessor: !!this.shipClass ? this.shipClass.idShipClass : undefined,
            idSuccessor: undefined,
            mark: !!this.shipClass ? this.shipClass.mark : 1,
            name: this.shipClass?.name!,
            // kind of read-only section of the model
            owner: {
                idUser: userID,
                role: role,
                isNpc: false,
                username: username,
                rolePlayData: {
                    shipNames: [],
                    shipNameTemplates: []
                }
            },
            shipClassCapabilities: {
                capabilities: []
            },
            spacecraftCapacityAreas: {
                passengerSpace: 0,
                cargoHold: {coordinate: 0, massMetric: "T"},
                capacityValues: []
            },
            ammunitionState: {
                shotsPerMissile: []
            },
            tonnage: {
                coordinate: 0, massMetric: "T"
            }
        };

        this.designedShipClass = output;

        if (!this.isChangePending()) {
            return;
        }
        this.fetchPropulsionCapacity(this.designedShipClass);
        this.shipClassEmitter.emit(output);
    }

    private isChangePending() {
        let result: boolean = false;
        if (!!this.compareClass && !!this.designedShipClass) {
            result = !ShipClassComparator.equals(this.compareClass, this.designedShipClass);
        } else if (!this.compareClass && !!this.designedShipClass) {
            result = true;
        }
        this.compareClass = this.designedShipClass;
        return result;
    }
}
