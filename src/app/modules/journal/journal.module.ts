import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {BattleReportComponent} from './components/payload/battle-report/battle-report.component';
import {JournalTabViewComponent} from './components/orga/journal-tab-view/journal-tab-view.component';
import {LostWarshipOverlayComponent} from './components/payload/lost-warship-overlay/lost-warship-overlay.component';
import {CombatArenaComponent} from './components/payload/combat-arena/combat-arena.component';
import {FleetMovementJournalComponent} from './components/payload/fleet-movement-journal/fleet-movement-journal.component';
import {FleetRoundStateComponent} from './components/payload/fleet-round-state/fleet-round-state.component';
import {JournalDashboardComponent} from './components/payload/dashboard-journal/journal-dashboard.component';
import {NgOptimizedImage} from "@angular/common";
import {MissionJournalComponent} from './components/payload/mission-journal/mission-journal.component';
import {JobOverviewComponent} from './components/payload/job-overview/job-overview.component';


@NgModule({
    declarations: [
        BattleReportComponent,
        JournalTabViewComponent,
        LostWarshipOverlayComponent,
        CombatArenaComponent,
        FleetMovementJournalComponent,
        FleetRoundStateComponent,
        JournalDashboardComponent,
        MissionJournalComponent,
        JobOverviewComponent,
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
        NgOptimizedImage,
    ]
})
export class JournalModule {
}
