import {Injectable, NgZone} from '@angular/core';
import {SubscriptionManager} from "../../subscription.manager";
import {
    Armor,
    ElectronicWarfare,
    Launcher,
    ModuleApiService,
    PassiveModule,
    Propulsion,
    ResourceDeposit,
    ResourcesApiService,
    ShipClass,
    ShipyardApiService,
    Sidewall,
    Weapon
} from "../swagger";
import {ReplaySubject} from "rxjs";

/**
 * Executed slow queries in the background and sends the data if the original request is finished.
 */
@Injectable()
export class ModuleService extends SubscriptionManager {

    private weaponsByUser: ReplaySubject<Weapon[]> = new ReplaySubject<Weapon[]>();
    private weapons: ReplaySubject<Weapon[]> = new ReplaySubject<Weapon[]>();

    private launchersByUser: ReplaySubject<Launcher[]> = new ReplaySubject<Launcher[]>();
    private launchers: ReplaySubject<Launcher[]> = new ReplaySubject<Launcher[]>();

    private armorsByUser: ReplaySubject<Armor[]> = new ReplaySubject<Armor[]>();
    private armors: ReplaySubject<Armor[]> = new ReplaySubject<Armor[]>();

    private sidewallsByUser: ReplaySubject<Sidewall[]> = new ReplaySubject<Sidewall[]>();
    private sidewalls: ReplaySubject<Sidewall[]> = new ReplaySubject<Sidewall[]>();

    private elokaByUser: ReplaySubject<ElectronicWarfare[]> = new ReplaySubject<ElectronicWarfare[]>();
    private eloka: ReplaySubject<ElectronicWarfare[]> = new ReplaySubject<ElectronicWarfare[]>();

    private passiveModulesByUser: ReplaySubject<PassiveModule[]> = new ReplaySubject<PassiveModule[]>();
    private passiveModules: ReplaySubject<PassiveModule[]> = new ReplaySubject<PassiveModule[]>();

    private propulsionsByUser: ReplaySubject<Propulsion[]> = new ReplaySubject<Propulsion[]>();
    private propulsions: ReplaySubject<Propulsion[]> = new ReplaySubject<Propulsion[]>();


    private shipClasses: ShipClass[] = [];
    private costsByShipClass: Map<number, ResourceDeposit> = new Map<number, ResourceDeposit>();

    private shipClassByUserEmitter: ReplaySubject<ShipClass[]> = new ReplaySubject<ShipClass[]>();

    constructor(private zone: NgZone,
                private resourceService: ResourcesApiService,
                private shipyardService: ShipyardApiService,
                private moduleApiService: ModuleApiService) {
        super();

        this.zone.run(() => {
            this.fetchWeapons();
            this.fetchLaunchers();
            this.fetchArmors();
            this.fetchSidewalls();
            this.fetchElokas();
            this.fetchPropulsions();
            this.fetchPassives();
            this.fetchShipClasses();
        });
    }

    public fetchShipClasses() {
        let sub = this.shipyardService.getShipClassesByUser().subscribe(resp => {
            this.shipClasses = resp;
            this.registerClassData();
            this.shipClassByUserEmitter.next(this.shipClasses);
        });
        this.subscriptions.push(sub);
    }

    getShipClassCosts(idShipClass: number): ReplaySubject<ResourceDeposit> {
        let costsEmitter: ReplaySubject<ResourceDeposit> = new ReplaySubject<ResourceDeposit>();
        if (this.costsByShipClass.has(idShipClass)) {
            setTimeout(() => {
                costsEmitter.next(this.costsByShipClass.get(idShipClass)!);
            }, 100);
        } else {
            this.fetchShipClassCosts(idShipClass);
        }
        return costsEmitter;
    }

    getShipClassesByUser() {
        return this.shipClassByUserEmitter;
    }

    private registerClassData() {
        for (let i = 0; i < this.shipClasses.length; i++) {
            let shipClass = this.shipClasses[i];
            this.fetchShipClassCosts(shipClass.idShipClass!);
        }
    }

    private fetchShipClassCosts(idShipClass: number, costsEmitter?: ReplaySubject<ResourceDeposit>) {
        let sub = this.resourceService.getCostsForShipClass(idShipClass)
            .subscribe(resp => {
                this.costsByShipClass.set(idShipClass, resp);
                costsEmitter?.next(this.costsByShipClass.get(idShipClass)!);
            });
        this.subscriptions.push(sub);
    }

    private fetchWeapons() {
        let sub = this.moduleApiService.getWeaponsByUser().subscribe(resp => this.weaponsByUser.next(resp));
        this.subscriptions.push(sub);
        sub = this.moduleApiService.getWeapons().subscribe(resp => this.weapons.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchLaunchers() {
        let sub = this.moduleApiService.getLaunchersByUser().subscribe(resp => this.launchersByUser.next(resp));
        this.subscriptions.push(sub);
        sub = this.moduleApiService.getLaunchers().subscribe(resp => this.launchers.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchArmors() {
        let sub = this.moduleApiService.getArmorsByUser().subscribe(resp => this.armorsByUser.next(resp));
        this.subscriptions.push(sub);
        sub = this.moduleApiService.getArmors().subscribe(resp => this.armors.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchSidewalls() {
        let sub = this.moduleApiService.getSidewallsByUser().subscribe(resp => this.sidewallsByUser.next(resp));
        this.subscriptions.push(sub);
        sub = this.moduleApiService.getSidewalls().subscribe(resp => this.sidewalls.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchElokas() {
        let sub = this.moduleApiService.getElectronicWarfareByUser().subscribe(resp => this.elokaByUser.next(resp));
        this.subscriptions.push(sub);
        sub = this.moduleApiService.getElectronicWarfare().subscribe(resp => this.eloka.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchPropulsions() {
        let sub = this.moduleApiService.getPropulsionsByUser().subscribe(resp => this.propulsionsByUser.next(resp));
        this.subscriptions.push(sub);
        sub = this.moduleApiService.getPropulsions().subscribe(resp => this.propulsions.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchPassives() {
        let sub = this.moduleApiService.getPassiveModulesByUser().subscribe(resp => this.passiveModulesByUser.next(resp));
        this.subscriptions.push(sub);
        sub = this.moduleApiService.getPassiveModules().subscribe(resp => this.passiveModules.next(resp));
        this.subscriptions.push(sub);
    }

    getWeaponsByUser() {
        return this.weaponsByUser;
    }

    getWeapons() {
        return this.weapons;
    }

    getLaunchersByUser() {
        return this.launchersByUser;
    }

    getLaunchers() {
        return this.launchers;
    }

    getArmorsByUser() {
        return this.armorsByUser;
    }

    getArmors() {
        return this.armors;
    }

    getSidewallsByUser() {
        return this.sidewallsByUser;
    }

    getSidewalls() {
        return this.sidewalls;
    }

    getElectronicWarfareByUser() {
        return this.elokaByUser;
    }

    getElectronicWarfare() {
        return this.eloka;
    }

    getPropulsionsByUser() {
        return this.propulsionsByUser;
    }

    getPropulsions() {
        return this.propulsions;
    }

    getPassiveModulesByUser() {
        return this.passiveModulesByUser;
    }

    getPassiveModules() {
        return this.passiveModules;
    }
}
