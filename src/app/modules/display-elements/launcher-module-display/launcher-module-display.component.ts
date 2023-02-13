import {Component, Input, OnInit} from '@angular/core';
import {Launcher, Missile} from "../../../services/swagger";
import {WeaponHelper} from "../../../services/helper/weapon.helper";

@Component({
    selector: 'app-launcher-module-display',
    templateUrl: './launcher-module-display.component.html',
    styleUrls: ['./launcher-module-display.component.scss']
})
export class LauncherModuleDisplayComponent implements OnInit {

    /**
     * the module which should be displayed
     */
    @Input()
    moduleInput!: Launcher;

    /**
     * the amount to display
     */
    @Input()
    amountInput?: number;

    @Input()
    alignmentInput?: string;

    constructor() {
    }

    ngOnInit(): void {
    }

    getRange(missile: Missile): number {
        return WeaponHelper.getMissileRange(missile);
    }
}
