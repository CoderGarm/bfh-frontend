import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {BattleReportComponent} from './components/payload/battle-report/battle-report.component';
import {JournalTabViewComponent} from './components/orga/journal-tab-view/journal-tab-view.component';
import {LostWarshipOverlayComponent} from './components/payload/lost-warship-overlay/lost-warship-overlay.component';
import {CombatArenaComponent} from './components/payload/combat-arena/combat-arena.component';


@NgModule({
    declarations: [
        BattleReportComponent,
        JournalTabViewComponent,
        LostWarshipOverlayComponent,
        CombatArenaComponent
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
    ]
})
export class JournalModule {
}
