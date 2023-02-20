import {
    AlignedFitting,
    AmmunitionFitting,
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
import {ShipClassFittingCreateComponent} from "../ship-class-fitting-create/ship-class-fitting-create.component";
import {AfterViewInit, Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {WeaponsSelection} from "../weapons-counter/weapons-counter.component";
import {WeaponHelper} from "../../../services/helper/weapon.helper";
import {FittingHelper} from "../../../services/helper/fitting.helper";

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

    ngAfterViewInit(): void {
        this.fetchBaseData();
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
        this.chooseHull(undefined);
        this.chooseArmor(undefined);
        this.chooseEloka(undefined);
        this.choosePropulsion(undefined);
        this.chooseSidewall(undefined);
        this.ammoSelection.clear();
        this.weaponsSelection.clear();
        this.supportSelection.clear();
    }

    chooseHull(hull?: Hull) {
        this.hullSelection = hull;
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
            hull: this.hullSelection!,
            fittings: weapons,
            ammunitionFittings: ammo,
            supportFittings: passives,
            armor: this.armorSelection,
            electronicWarfare: this.elokaSelection,
            propulsion: this.propulsionSelection,
            sidewall: this.sidewallSelection,
            idPredecessor: !!this.shipClass ? this.shipClass.idShipClass : undefined,
            idSuccessor: undefined,
            mark: !!this.shipClass ? this.shipClass.mark : 1,
            name: this.shipClass?.name!,
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
        this.designedShipClass = output;
        this.shipClassEmitter.emit(output);
    }
}