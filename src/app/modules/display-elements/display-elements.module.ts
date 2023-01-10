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
import {FleetDisplayComponent} from './fleet-display/fleet-display.component';
import {ConstructionDisplayComponent} from "./construction-display/construction-display.component";
import {ShipClassBuildComponent} from "./ship-class-build/ship-class-build.component";
import {FleetFormationDisplay} from './fleet-formation-display/fleet-formation-display.component';
import {SpacecraftCapabilitiesDisplayComponent} from './spacecraft-capabilities-display/spacecraft-capabilities-display.component';
import {FleetMergeEditComponent} from './fleet-merge-edit/fleet-merge-edit.component';
import {FleetMoveEditComponent} from './fleet-move-edit/fleet-move-edit.component';
import {FleetMoveDisplayComponent} from './fleet-move-display/fleet-move-display.component';
import {MiningFactorsDisplayComponent} from './mining-factors-display/mining-factors-display.component';
import {InterstellarFleetDisplayComponent} from './interstellar-fleet-display/interstellar-fleet-display.component';
import {InterstellarFleetMovementEditComponent} from './interstellar-fleet-movement-edit/interstellar-fleet-movement-edit.component';
import {LauncherModuleDisplayComponent} from './launcher-module-display/launcher-module-display.component';
import {LauncherCounterComponent} from './launcher-counter/launcher-counter.component';
import {TechTreeDisplayComponent} from './tech-tree-display/tech-tree-display.component';
import {JobListDisplayComponent} from './job-list-display/job-list-display.component';
import {SpacecraftCapabilityDisplaySmallComponent} from "./spacecraft-capability-display-small/spacecraft-capability-display-small.component";
import {ResourceDisplayModule} from "./modules/resource-display/resource-display.module";
import {PopulationDevelopmentComponent} from './population-development/population-development.component';
import {TransportationListDisplayComponent} from './transportation-list-display/transportation-list-display.component';
import {ConstructionCapacityDisplayComponent} from './construction-capacity-display/construction-capacity-display.component';
import {ManualTransportComponent} from './manual-transport/manual-transport.component';
import {SingleResourceTransferComponent} from './single-resource-transfer/single-resource-transfer.component';
import {FinishedMovementsListComponent} from "./finished-movements-list/finished-movements-list.component";
import {FinishedColonizationsListComponent} from "./finished-colonizations-list/finished-colonizations-list.component";
import {SpacecraftStateBlockDisplayComponent} from './spacecraft-state-block-display/spacecraft-state-block-display.component';
import {AmmunitionRosterComponent} from './ammunition-roster/ammunition-roster.component';
import {MilitaryPeopleComponent} from './military-people/military-people.component';
import {CommissionedOperationalsComponent} from './commissioned-operationals/commissioned-operationals.component';

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
        ConstructionDisplayComponent,
        SidewallModuleSelectorComponent,
        PropulsionModuleSelectorComponent,
        PassiveModuleCounterComponent,
        ElokaModuleSelectorComponent,
        ArmorModuleSelectorComponent,
        AmmunitionModuleCounterComponent,
        BaseModuleSingleSelectorComponent,
        FleetDisplayComponent,
        ShipClassBuildComponent,
        FleetFormationDisplay,
        SpacecraftCapabilitiesDisplayComponent,
        SpacecraftCapabilityDisplaySmallComponent,
        FleetMergeEditComponent,
        FleetMoveEditComponent,
        FleetMoveDisplayComponent,
        MiningFactorsDisplayComponent,
        InterstellarFleetDisplayComponent,
        InterstellarFleetMovementEditComponent,
        LauncherModuleDisplayComponent,
        LauncherCounterComponent,
        TechTreeDisplayComponent,
        JobListDisplayComponent,
        PopulationDevelopmentComponent,
        TransportationListDisplayComponent,
        ConstructionCapacityDisplayComponent,
        ManualTransportComponent,
        SingleResourceTransferComponent,
        FinishedMovementsListComponent,
        FinishedColonizationsListComponent,
        SpacecraftStateBlockDisplayComponent,
        AmmunitionRosterComponent,
        MilitaryPeopleComponent,
        CommissionedOperationalsComponent,
    ],
    imports: [
        SharedModuleModule,
        ResourceDisplayModule,
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
        ConstructionDisplayComponent,
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
        FleetDisplayComponent,
        ShipClassBuildComponent,
        FleetFormationDisplay,
        SpacecraftCapabilitiesDisplayComponent,
        SpacecraftCapabilityDisplaySmallComponent,
        FleetMergeEditComponent,
        FleetMoveEditComponent,
        FleetMoveDisplayComponent,
        MiningFactorsDisplayComponent,
        InterstellarFleetDisplayComponent,
        InterstellarFleetMovementEditComponent,
        LauncherModuleDisplayComponent,
        LauncherCounterComponent,
        TechTreeDisplayComponent,
        JobListDisplayComponent,
        ResourceDisplayModule,
        PopulationDevelopmentComponent,
        TransportationListDisplayComponent,
        ConstructionCapacityDisplayComponent,
        ManualTransportComponent,
        SingleResourceTransferComponent,
        FinishedMovementsListComponent,
        FinishedColonizationsListComponent,
        SpacecraftStateBlockDisplayComponent,
        AmmunitionRosterComponent,
        MilitaryPeopleComponent,
        CommissionedOperationalsComponent,
    ]
})
export class DisplayElementsModule {
}
