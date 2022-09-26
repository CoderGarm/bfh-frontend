import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {BattleReportComponent} from './components/payload/battle-report/battle-report.component';
import {JournalTabViewComponent} from './components/orga/journal-tab-view/journal-tab-view.component';
import {LostWarshipOverlayComponent} from './components/payload/lost-warship-overlay/lost-warship-overlay.component';
import {CombatArenaComponent} from './components/payload/combat-arena/combat-arena.component';
import {JobJournalComponent} from './components/payload/job-journal/job-journal.component';
import {FleetMovementJournalComponent} from './components/payload/fleet-movement-journal/fleet-movement-journal.component';
import {FleetRoundStateComponent} from './components/payload/fleet-round-state/fleet-round-state.component';


@NgModule({
    declarations: [
        BattleReportComponent,
        JournalTabViewComponent,
        LostWarshipOverlayComponent,
        CombatArenaComponent,
        JobJournalComponent,
        FleetMovementJournalComponent,
        FleetRoundStateComponent
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
    ]
})
export class JournalModule {
}
