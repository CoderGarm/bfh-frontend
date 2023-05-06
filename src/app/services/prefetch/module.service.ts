import {Injectable, NgZone} from '@angular/core';
import {SubscriptionManager} from "../../subscription.manager";
import {Armor, ElectronicWarfare, Launcher, ModuleApiService, PassiveModule, Propulsion, Sidewall, Weapon} from "../swagger";
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

    constructor(private zone: NgZone,
                private moduleApi: ModuleApiService) {
        super();

        this.zone.run(() => this.fetchWeapons());
        this.zone.run(() => this.fetchLaunchers());
        this.zone.run(() => this.fetchArmors());
        this.zone.run(() => this.fetchSidewalls());
        this.zone.run(() => this.fetchElokas());
        this.zone.run(() => this.fetchPropulsions());
        this.zone.run(() => this.fetchPassives());
    }

    private fetchWeapons() {
        let sub = this.moduleApi.getWeaponsByUser().subscribe(resp => this.weaponsByUser.next(resp));
        this.subscriptions.push(sub);
        sub = this.moduleApi.getWeapons().subscribe(resp => this.weapons.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchLaunchers() {
        let sub = this.moduleApi.getLaunchersByUser().subscribe(resp => this.launchersByUser.next(resp));
        this.subscriptions.push(sub);
        sub = this.moduleApi.getLaunchers().subscribe(resp => this.launchers.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchArmors() {
        let sub = this.moduleApi.getArmorsByUser().subscribe(resp => this.armorsByUser.next(resp));
        this.subscriptions.push(sub);
        sub = this.moduleApi.getArmors().subscribe(resp => this.armors.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchSidewalls() {
        let sub = this.moduleApi.getSidewallsByUser().subscribe(resp => this.sidewallsByUser.next(resp));
        this.subscriptions.push(sub);
        sub = this.moduleApi.getSidewalls().subscribe(resp => this.sidewalls.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchElokas() {
        let sub = this.moduleApi.getElectronicWarfareByUser().subscribe(resp => this.elokaByUser.next(resp));
        this.subscriptions.push(sub);
        sub = this.moduleApi.getElectronicWarfare().subscribe(resp => this.eloka.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchPropulsions() {
        let sub = this.moduleApi.getPropulsionsByUser().subscribe(resp => this.propulsionsByUser.next(resp));
        this.subscriptions.push(sub);
        sub = this.moduleApi.getPropulsions().subscribe(resp => this.propulsions.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchPassives() {
        let sub = this.moduleApi.getPassiveModulesByUser().subscribe(resp => this.passiveModulesByUser.next(resp));
        this.subscriptions.push(sub);
        sub = this.moduleApi.getPassiveModules().subscribe(resp => this.passiveModules.next(resp));
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
