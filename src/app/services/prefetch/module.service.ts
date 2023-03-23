import {Injectable, NgZone} from '@angular/core';
import {SubscriptionManager} from "../../subscription.manager";
import {Armor, ElectronicWarfare, Launcher, ModuleApiService, PassiveModule, Propulsion, Sidewall, Weapon} from "../swagger";
import {ReplaySubject} from "rxjs";

/**
 * Executed slow queries in the background and sends the data if the original request is finished.
 */
@Injectable()
export class ModuleService extends SubscriptionManager {

    private weapons: ReplaySubject<Weapon[]> = new ReplaySubject<Weapon[]>();
    private launchers: ReplaySubject<Launcher[]> = new ReplaySubject<Launcher[]>();
    private armors: ReplaySubject<Armor[]> = new ReplaySubject<Armor[]>();
    private sidewalls: ReplaySubject<Sidewall[]> = new ReplaySubject<Sidewall[]>();
    private eloka: ReplaySubject<ElectronicWarfare[]> = new ReplaySubject<ElectronicWarfare[]>();
    private passiveModules: ReplaySubject<PassiveModule[]> = new ReplaySubject<PassiveModule[]>();
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
        let sub = this.moduleApi.getWeaponsByUser().subscribe(resp => this.weapons.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchLaunchers() {
        let sub = this.moduleApi.getLaunchersByUser().subscribe(resp => this.launchers.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchArmors() {
        let sub = this.moduleApi.getArmorsByUser().subscribe(resp => this.armors.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchSidewalls() {
        let sub = this.moduleApi.getSidewallsByUser().subscribe(resp => this.sidewalls.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchElokas() {
        let sub = this.moduleApi.getElectronicWarfareByUser().subscribe(resp => this.eloka.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchPropulsions() {
        let sub = this.moduleApi.getPropulsionsByUser().subscribe(resp => this.propulsions.next(resp));
        this.subscriptions.push(sub);
    }

    private fetchPassives() {
        let sub = this.moduleApi.getPassiveModulesByUser().subscribe(resp => this.passiveModules.next(resp));
        this.subscriptions.push(sub);
    }

    getWeaponsByUser() {
        return this.weapons;
    }

    getLaunchersByUser() {
        return this.launchers;
    }

    getArmorsByUser() {
        return this.armors;
    }

    getSidewallsByUser() {
        return this.sidewalls;
    }

    getElectronicWarfareByUser() {
        return this.eloka;
    }

    getPropulsionsByUser() {
        return this.propulsions;
    }

    getPassiveModulesByUser() {
        return this.passiveModules;
    }
}
