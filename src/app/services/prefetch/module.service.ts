import {Injectable, NgZone} from '@angular/core';
import {SubscriptionManager} from "../../subscription.manager";
import {
    Armor,
    ElectronicWarfare,
    Launcher,
    ModuleApiService,
    PassiveModule,
    Propulsion,
    PublicResourcesApiService,
    ResourceDeposit,
    ResourcesApiService,
    ShipClass,
    ShipyardApiService,
    Sidewall,
    Weapon
} from "../swagger";
import {ReplaySubject} from "rxjs";
import {AuthenticationService} from "../authentication";
import {TypeService} from "../type.service";

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

    private isLoggedIn: boolean = false;

    constructor(private zone: NgZone,
                private authService: AuthenticationService,
                private resourceService: ResourcesApiService,
                private publicResourcesService: PublicResourcesApiService,
                private shipyardService: ShipyardApiService,
                private moduleApiService: ModuleApiService,
                private typeService: TypeService) {
        super();

        let sub = this.authService.getAccessData().subscribe(loggedIn => {
            this.isLoggedIn = !!loggedIn;
            this.fetchBaseData();
        });
        this.subscriptions.push(sub);

        this.fetchBaseData();
    }

    private fetchBaseData() {
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
        if (!this.isLoggedIn) {
            return;
        }
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
            this.fetchShipClassCosts(idShipClass, costsEmitter);
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
        let sub = this.publicResourcesService.getWeapons().subscribe(resp => this.weapons.next(resp));
        this.subscriptions.push(sub);

        if (!this.isLoggedIn) {
            return;
        }
        sub = this.moduleApiService.getWeaponsByUser().subscribe(resp => this.weaponsByUser.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchLaunchers() {
        let sub = this.publicResourcesService.getLaunchers().subscribe(resp => this.launchers.next(resp));
        this.subscriptions.push(sub);
        if (!this.isLoggedIn) {
            return;
        }
        sub = this.moduleApiService.getLaunchersByUser().subscribe(resp => this.launchersByUser.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchArmors() {
        let sub = this.publicResourcesService.getArmors().subscribe(resp => this.armors.next(resp));
        this.subscriptions.push(sub);
        if (!this.isLoggedIn) {
            return;
        }
        sub = this.moduleApiService.getArmorsByUser().subscribe(resp => this.armorsByUser.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchSidewalls() {
        let sub = this.publicResourcesService.getSidewalls().subscribe(resp => this.sidewalls.next(resp));
        this.subscriptions.push(sub);
        if (!this.isLoggedIn) {
            return;
        }
        sub = this.moduleApiService.getSidewallsByUser().subscribe(resp => this.sidewallsByUser.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchElokas() {
        let sub = this.publicResourcesService.getElectronicWarfare().subscribe(resp => this.eloka.next(resp));
        this.subscriptions.push(sub);
        if (!this.isLoggedIn) {
            return;
        }
        sub = this.moduleApiService.getElectronicWarfareByUser().subscribe(resp => this.elokaByUser.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchPropulsions() {
        let sub = this.publicResourcesService.getPropulsions().subscribe(resp => this.propulsions.next(resp));
        this.subscriptions.push(sub);
        if (!this.isLoggedIn) {
            return;
        }
        sub = this.moduleApiService.getPropulsionsByUser().subscribe(resp => this.propulsionsByUser.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchPassives() {
        let sub = this.publicResourcesService.getPassiveModules().subscribe(resp => this.passiveModules.next(resp));
        this.subscriptions.push(sub);
        if (!this.isLoggedIn) {
            return;
        }
        sub = this.moduleApiService.getPassiveModulesByUser().subscribe(resp => this.passiveModulesByUser.next(resp));
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
