import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ShipClassDisplayComponent} from './ship-class-display/ship-class-display.component';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {HullDisplayComponent} from './hull-display/hull-display.component';
import {BaseModuleDisplayComponent} from './base-module-display/base-module-display.component';
import {AmmunitionModuleDisplayComponent} from './ammunition-module-display/ammunition-module-display.component';
import {PassiveModuleDisplayComponent} from './passive-module-display/passive-module-display.component';
import {ElokaModuleDisplayComponent} from './eloka-module-display/eloka-module-display.component';
import {SidewallModuleDisplayComponent} from './sidewall-module-display/sidewall-module-display.component';
import {PropulsionModuleDisplayComponent} from './propulsion-module-display/propulsion-module-display.component';
import {ArmorModuleDisplayComponent} from './armor-module-display/armor-module-display.component';
import {WeaponModuleDisplayComponent} from './weapon-module-display/weapon-module-display.component';
import {AlignedFittingModuleDisplayComponent} from './aligned-fitting-module-display/aligned-fitting-module-display.component';
import {AmmunitionFittingModuleDisplayComponent} from './ammunition-fitting-module-display/ammunition-fitting-module-display.component';
import {SupportFittingModuleDisplayComponent} from './support-fitting-module-display/support-fitting-module-display.component';


@NgModule({
    declarations: [
        ShipClassDisplayComponent,
        HullDisplayComponent,
        BaseModuleDisplayComponent,
        AmmunitionModuleDisplayComponent,
        PassiveModuleDisplayComponent,
        ElokaModuleDisplayComponent,
        SidewallModuleDisplayComponent,
        PropulsionModuleDisplayComponent,
        ArmorModuleDisplayComponent,
        WeaponModuleDisplayComponent,
        AlignedFittingModuleDisplayComponent,
        AmmunitionFittingModuleDisplayComponent,
        SupportFittingModuleDisplayComponent
    ],
    imports: [
        SharedModuleModule,
        CommonModule,
        CommonModule
    ],
    exports: [
        ShipClassDisplayComponent
    ]
})
export class DisplayElementsModule {
}
