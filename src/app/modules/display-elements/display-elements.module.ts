import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {HullDisplayComponent} from './hull-display/hull-display.component';
import {BaseModuleDisplayComponent} from './base-module-display/base-module-display.component';
import {ResearchDisplayComponent} from './research-display/research-display.component';
import {ShipClassFittingCreateComponent} from './ship-class-fitting-create/ship-class-fitting-create.component';
import {BaseModuleSingleSelectorComponent} from './base-module-single-selector/base-module-single-selector.component';
import {FleetDisplayComponent} from './fleet-display/fleet-display.component';
import {ConstructionDisplayComponent} from "./construction-display/construction-display.component";
import {FleetFormationDisplay} from './fleet-formation-display/fleet-formation-display.component';
import {SpacecraftCapabilitiesDisplayComponent} from './spacecraft-capabilities-display/spacecraft-capabilities-display.component';
import {FleetMergeEditComponent} from './fleet-merge-edit/fleet-merge-edit.component';
import {FleetMoveEditComponent} from './fleet-move-edit/fleet-move-edit.component';
import {FleetMoveDisplayComponent} from './fleet-move-display/fleet-move-display.component';
import {MiningFactorsDisplayComponent} from './mining-factors-display/mining-factors-display.component';
import {InterstellarFleetMovementEditComponent} from './interstellar-fleet-movement-edit/interstellar-fleet-movement-edit.component';
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
import {ShipClassFittingModifyComponent} from './ship-class-fitting-modify/ship-class-fitting-modify.component';
import {WeaponDisplayComponent} from './weapon-display/weapon-display.component';
import {WeaponPerAlignmentCounterComponent} from './weapon-per-alingment-counter/weapon-per-alignment-counter.component';
import {ModuleDisplayComponent} from './module-display/module-display.component';
import {WeaponsByTypeDisplayComponent} from './weapons-by-type-display/weapons-by-type-display.component';
import {WeaponAmountByAlignmentDisplayComponent} from './weapon-amount-by-alignment-display/weapon-amount-by-alignment-display.component';
import {PropulsionCapacityDisplayComponent} from './propulsion-capacity-display/propulsion-capacity-display.component';
import {PropulsionDisplayComponent} from "../../display-elements/propulsion-display/propulsion-display.component";

@NgModule({
    declarations: [
        HullDisplayComponent,
        BaseModuleDisplayComponent,
        ResearchDisplayComponent,
        ShipClassFittingCreateComponent,
        ConstructionDisplayComponent,
        PropulsionDisplayComponent,
        BaseModuleSingleSelectorComponent,
        FleetDisplayComponent,
        FleetFormationDisplay,
        SpacecraftCapabilitiesDisplayComponent,
        SpacecraftCapabilityDisplaySmallComponent,
        FleetMergeEditComponent,
        FleetMoveEditComponent,
        FleetMoveDisplayComponent,
        MiningFactorsDisplayComponent,
        InterstellarFleetMovementEditComponent,
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
        ShipClassFittingModifyComponent,
        WeaponDisplayComponent,
        WeaponPerAlignmentCounterComponent,
        ModuleDisplayComponent,
        WeaponsByTypeDisplayComponent,
        WeaponAmountByAlignmentDisplayComponent,
        PropulsionCapacityDisplayComponent,
    ],
    imports: [
        SharedModuleModule,
        ResourceDisplayModule,
    ],
    exports: [
        HullDisplayComponent,
        BaseModuleDisplayComponent,
        ResearchDisplayComponent,
        ConstructionDisplayComponent,
        ShipClassFittingCreateComponent,
        PropulsionDisplayComponent,
        BaseModuleSingleSelectorComponent,
        FleetDisplayComponent,
        FleetFormationDisplay,
        SpacecraftCapabilitiesDisplayComponent,
        SpacecraftCapabilityDisplaySmallComponent,
        FleetMergeEditComponent,
        FleetMoveEditComponent,
        FleetMoveDisplayComponent,
        MiningFactorsDisplayComponent,
        InterstellarFleetMovementEditComponent,
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
        ShipClassFittingModifyComponent,
        WeaponDisplayComponent,
        WeaponAmountByAlignmentDisplayComponent,
        ModuleDisplayComponent,
    ]
})
export class DisplayElementsModule {
}
