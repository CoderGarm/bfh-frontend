import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {StratOpsTabViewComponent} from './orga/strat-ops-tab-view/strat-ops-tab-view.component';
import {MissionAdministrationComponent} from './payload/mission-administration/mission-administration.component';
import {MissionOverviewComponent} from './payload/mission-overview/mission-overview.component';
import {NgxSpinnerModule} from "ngx-spinner";
import {MissionMapComponent} from "./payload/mission-map/mission-map.component";
import {MissionDisplayComponent} from './payload/mission-display/mission-display.component';
import {MissionCreateComponent} from './payload/mission-create/mission-create.component';


@NgModule({
    declarations: [
        StratOpsTabViewComponent,
        MissionMapComponent,
        MissionAdministrationComponent,
        MissionOverviewComponent,
        MissionDisplayComponent,
        MissionCreateComponent,
    ],
    exports: [
        StratOpsTabViewComponent
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
        NgxSpinnerModule,
    ]
})
export class StrategicOperationsModule {
}
