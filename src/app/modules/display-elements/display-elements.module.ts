import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {BaseModuleDisplayComponent} from './base-module-display/base-module-display.component';
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
import {JobListDisplayComponent} from './job-list-display/job-list-display.component';
import {SpacecraftCapabilityDisplaySmallComponent} from "./spacecraft-capability-display-small/spacecraft-capability-display-small.component";
import {PopulationDevelopmentComponent} from './population-development/population-development.component';
import {TransportationListDisplayComponent} from './transportation-list-display/transportation-list-display.component';
import {ShipClassTonnagePerSectionDisplayComponent} from './construction-capacity-display/ship-class-tonnage-per-section-display.component';
import {ManualFleetTransportComponent} from './manual-transport/manual-fleet-transport.component';
import {SingleResourceTransferComponent} from './single-resource-transfer/single-resource-transfer.component';
import {FinishedMovementListComponent} from "./finished-movements-list/finished-movement-list.component";
import {FinishedColonizationsListComponent} from "./finished-colonizations-list/finished-colonizations-list.component";
import {SpacecraftStateBlockDisplayComponent} from './spacecraft-state-block-display/spacecraft-state-block-display.component';
import {AmmunitionRosterComponent} from './ammunition-roster/ammunition-roster.component';
import {MilitaryPeopleComponent} from './military-people/military-people.component';
import {CommissionedOperationalsComponent} from './commissioned-operationals/commissioned-operationals.component';
import {WeaponDisplayComponent} from './weapon-display/weapon-display.component';
import {WeaponPerAlignmentCounterComponent} from './weapon-per-alingment-counter/weapon-per-alignment-counter.component';
import {ModuleDisplayComponent} from './module-display/module-display.component';
import {WeaponsByTypeDisplayComponent} from './weapons-by-type-display/weapons-by-type-display.component';
import {WeaponAmountByAlignmentDisplayComponent} from './weapon-amount-by-alignment-display/weapon-amount-by-alignment-display.component';
import {PropulsionCapacityDisplayComponent} from './propulsion-capacity-display/propulsion-capacity-display.component';
import {TradeDeliveriesComponent} from './trade-deliveries/trade-deliveries.component';
import {ResourceDisplayComponent} from "./resource-display/resource-display.component";
import {RedBoxComponent} from './red-box/red-box.component';
import {SliderWheelComponent} from './slider-wheel/slider-wheel.component';
import {BlueCardComponent} from './blue-card/blue-card.component';
import {TradeDisplayComponent} from './trade-display/trade-display.component';
import {MissionResultComponent} from './mission-result/mission-result.component';
import {TradeLossComponent} from "./trade-loss/trade-loss.component";
import {JobDisplayComponent} from './job-display/job-display.component';
import {FleetFinishedMoveDisplayComponent} from './fleet-finished-move-display/fleet-finished-move-display.component';
import {FleetMovementListComponent} from "./fleet-movement-list/fleet-movement-list.component";
import {PropulsionModuleDisplayComponent} from './propulsion-module-display/propulsion-module-display.component';
import {BuildingDisplayComponent} from './building-display/building-display.component';
import {OrbitalModuleDisplayComponent} from "./orbital-module-display/orbital-module-display.component";
import {PropertyDescriptorDisplayComponent} from "./property-descriptor-display/property-descriptor-display.component";
import {PropertiesArmorComponent} from './property-descriptor-display/payload/properties-armor/properties-armor.component';
import {PropertiesElokaComponent} from './property-descriptor-display/payload/properties-eloka/properties-eloka.component';
import {PropertiesLauncherComponent} from './property-descriptor-display/payload/properties-launcher/properties-launcher.component';
import {PropertiesMissileComponent} from './property-descriptor-display/payload/properties-missile/properties-missile.component';
import {PropertiesOrbitalModuleComponent} from './property-descriptor-display/payload/properties-orbital-module/properties-orbital-module.component';
import {PropertiesPassiveModuleComponent} from './property-descriptor-display/payload/properties-passive-module/properties-passive-module.component';
import {PropertiesPropulsionComponent} from './property-descriptor-display/payload/properties-propulsion/properties-propulsion.component';
import {PropertiesSidewallComponent} from './property-descriptor-display/payload/properties-sidewall/properties-sidewall.component';
import {PropertiesWeaponComponent} from './property-descriptor-display/payload/properties-weapon/properties-weapon.component';
import {PropertyHolder} from "./property-descriptor-display/payload/property-holder";

@NgModule({
    declarations: [
        BaseModuleDisplayComponent,
        ResourceDisplayComponent,
        ConstructionDisplayComponent,
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
        JobListDisplayComponent,
        PopulationDevelopmentComponent,
        TransportationListDisplayComponent,
        ShipClassTonnagePerSectionDisplayComponent,
        ManualFleetTransportComponent,
        SingleResourceTransferComponent,
        FinishedMovementListComponent,
        FinishedColonizationsListComponent,
        SpacecraftStateBlockDisplayComponent,
        AmmunitionRosterComponent,
        MilitaryPeopleComponent,
        CommissionedOperationalsComponent,
        WeaponDisplayComponent,
        WeaponPerAlignmentCounterComponent,
        ModuleDisplayComponent,
        WeaponsByTypeDisplayComponent,
        WeaponAmountByAlignmentDisplayComponent,
        PropulsionCapacityDisplayComponent,
        TradeDeliveriesComponent,
        RedBoxComponent,
        SliderWheelComponent,
        BlueCardComponent,
        TradeDisplayComponent,
        TradeLossComponent,
        MissionResultComponent,
        JobDisplayComponent,
        FleetFinishedMoveDisplayComponent,
        FleetMovementListComponent,
        PropulsionModuleDisplayComponent,
        BuildingDisplayComponent,
        OrbitalModuleDisplayComponent,
        PropertyDescriptorDisplayComponent,
        PropertiesArmorComponent,
        PropertiesElokaComponent,
        PropertiesLauncherComponent,
        PropertiesMissileComponent,
        PropertiesOrbitalModuleComponent,
        PropertiesPassiveModuleComponent,
        PropertiesPropulsionComponent,
        PropertiesSidewallComponent,
        PropertiesWeaponComponent,
        PropertyHolder,
    ],
    imports: [
        SharedModuleModule,
    ],
    exports: [
        BaseModuleDisplayComponent,
        ResourceDisplayComponent,
        ConstructionDisplayComponent,
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
        JobListDisplayComponent,
        PopulationDevelopmentComponent,
        TransportationListDisplayComponent,
        ShipClassTonnagePerSectionDisplayComponent,
        ManualFleetTransportComponent,
        SingleResourceTransferComponent,
        FinishedMovementListComponent,
        FinishedColonizationsListComponent,
        SpacecraftStateBlockDisplayComponent,
        AmmunitionRosterComponent,
        MilitaryPeopleComponent,
        CommissionedOperationalsComponent,
        WeaponDisplayComponent,
        WeaponAmountByAlignmentDisplayComponent,
        WeaponPerAlignmentCounterComponent,
        PropulsionCapacityDisplayComponent,
        ModuleDisplayComponent,
        TradeDeliveriesComponent,
        RedBoxComponent,
        SliderWheelComponent,
        BlueCardComponent,
        TradeDisplayComponent,
        TradeLossComponent,
        MissionResultComponent,
        JobDisplayComponent,
        FleetFinishedMoveDisplayComponent,
        FleetMovementListComponent,
        PropulsionModuleDisplayComponent,
        BuildingDisplayComponent,
        OrbitalModuleDisplayComponent,
        PropertyDescriptorDisplayComponent,
    ]
})
export class DisplayElementsModule {
}
