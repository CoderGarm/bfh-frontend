import {Component} from '@angular/core';
import {SubscriptionManager} from "../../../../subscription.manager";
import {ModuleService} from "../../../../services/prefetch/module.service";
import {Armor, ElectronicWarfare, Launcher, PassiveModule, Propulsion, Sidewall, Weapon} from "../../../../services/swagger";

@Component({
    selector: 'app-library-module-display',
    templateUrl: './library-module-display.component.html',
    styleUrls: ['./library-module-display.component.scss']
})
export class LibraryModuleDisplayComponent extends SubscriptionManager {

    weapons: Weapon[] = [];
    launchers: Launcher[] = [];
    armors: Armor[] = [];
    sidewalls: Sidewall[] = [];
    eloka: ElectronicWarfare[] = [];
    passiveModules: PassiveModule[] = [];
    propulsions: Propulsion[] = [];

    constructor(private moduleService: ModuleService) {
        super();

        let sub = this.moduleService.getWeapons().subscribe(resp => {
            this.weapons = resp
            console.log(resp)
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getLaunchers().subscribe(resp => {
            this.launchers = resp
            console.log(resp)
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getArmors().subscribe(resp => {
            this.armors = resp
            console.log(resp)
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getSidewalls().subscribe(resp => {
            this.sidewalls = resp
            console.log(resp)
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getElectronicWarfare().subscribe(resp => {
            this.eloka = resp
            console.log(resp)
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getPassiveModules().subscribe(resp => {
            this.passiveModules = resp
            console.log(resp)
        });
        this.subscriptions.push(sub);
        sub = this.moduleService.getPropulsions().subscribe(resp => {
            this.propulsions = resp
            console.log(resp)
        });
        this.subscriptions.push(sub);
    }
}
