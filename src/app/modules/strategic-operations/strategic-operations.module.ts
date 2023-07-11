import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {StratOpsTabViewComponent} from './orga/strat-ops-tab-view/strat-ops-tab-view.component';
import {MissionDisplayComponent} from './payload/mission-display/mission-display.component';


@NgModule({
    declarations: [
        StratOpsTabViewComponent,
        MissionDisplayComponent
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
    ]
})
export class StrategicOperationsModule {
}
