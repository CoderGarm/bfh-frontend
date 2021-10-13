import {NgModule} from '@angular/core';
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
import {ResearchDisplayComponent} from './research-display/research-display.component';
import {ShipClassFittingSelectionComponent} from './ship-class-fitting-selection/ship-class-fitting-selection.component';
import {WeaponsCounterComponent} from './weapons-counter/weapons-counter.component';
import {BaseModuleCounterComponent} from './base-module-counter/base-module-counter.component';
import {SidewallModuleSelectorComponent} from './sidewall-module-selector/sidewall-module-selector.component';
import {PropulsionModuleSelectorComponent} from './propulsion-module-selector/propulsion-module-selector.component';
import {PassiveModuleCounterComponent} from './passive-module-counter/passive-module-counter.component';
import {ElokaModuleSelectorComponent} from './eloka-module-selector/eloka-module-selector.component';
import {ArmorModuleSelectorComponent} from './armor-module-selector/armor-module-selector.component';
import {AmmunitionModuleCounterComponent} from './ammunition-module-counter/ammunition-module-counter.component';
import {BaseModuleSingleSelectorComponent} from './base-module-single-selector/base-module-single-selector.component';

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
        SupportFittingModuleDisplayComponent,
        ResearchDisplayComponent,
        ShipClassFittingSelectionComponent,
        BaseModuleCounterComponent,
        WeaponsCounterComponent,
        SidewallModuleSelectorComponent,
        PropulsionModuleSelectorComponent,
        PassiveModuleCounterComponent,
        ElokaModuleSelectorComponent,
        ArmorModuleSelectorComponent,
        AmmunitionModuleCounterComponent,
        BaseModuleSingleSelectorComponent,
    ],
    imports: [
        SharedModuleModule,
    ],
    exports: [
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
        SupportFittingModuleDisplayComponent,
        ResearchDisplayComponent,
        ShipClassFittingSelectionComponent,
        WeaponsCounterComponent,
        SidewallModuleSelectorComponent,
        PropulsionModuleSelectorComponent,
        PassiveModuleCounterComponent,
        ElokaModuleSelectorComponent,
        ArmorModuleSelectorComponent,
        AmmunitionModuleCounterComponent,
    ]
})
export class DisplayElementsModule {
}
