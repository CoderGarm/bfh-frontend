import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {BattleReportComponent} from './components/payload/battle-report/battle-report.component';
import {JournalTabViewComponent} from './components/orga/journal-tab-view/journal-tab-view.component';
import {LostWarshipOverlayComponent} from './components/payload/lost-warship-overlay/lost-warship-overlay.component';
import {CombatArenaComponent} from './components/payload/combat-arena/combat-arena.component';
import {FleetRoundStateComponent} from './components/payload/fleet-round-state/fleet-round-state.component';
import {JournalDashboardComponent} from './components/payload/dashboard-journal/journal-dashboard.component';
import {NgOptimizedImage} from "@angular/common";
import {MissionJournalComponent} from './components/payload/mission-journal/mission-journal.component';
import {JobOverviewComponent} from './components/payload/job-overview/job-overview.component';
import {AdvisoryBoardComponent} from './components/payload/advisory-board/advisory-board.component';
import {NgxSpinnerModule} from "ngx-spinner";
import {NgxEchartsModule} from "ngx-echarts";
import {BattleRegisterComponent} from './components/payload/battle-register/battle-register.component';
import {BattleReportStatisticsDisplayComponent} from './components/payload/battle-report-statistics-display/battle-report-statistics-display.component';
import {BattleReportShareComponent} from './components/payload/battle-report-share/battle-report-share.component';


@NgModule({
    declarations: [
        BattleReportComponent,
        JournalTabViewComponent,
        LostWarshipOverlayComponent,
        CombatArenaComponent,
        FleetRoundStateComponent,
        JournalDashboardComponent,
        MissionJournalComponent,
        JobOverviewComponent,
        AdvisoryBoardComponent,
        BattleRegisterComponent,
        BattleReportStatisticsDisplayComponent,
        BattleReportShareComponent,
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
        NgOptimizedImage,
        NgxSpinnerModule,
        NgxEchartsModule,
    ]
})
export class JournalModule {
}
