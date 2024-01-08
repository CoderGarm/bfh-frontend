import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {PlayerPointsListComponent} from './payload/player-points-list/player-points-list.component';
import {PlayerPointsTabViewComponent} from './orga/player-points-tab-view/player-points-tab-view.component';
import {EventPointsListComponent} from './payload/event-points-list/event-points-list.component';


@NgModule({
    declarations: [
        PlayerPointsListComponent,
        PlayerPointsTabViewComponent,
        EventPointsListComponent
    ],
    imports: [
        SharedModuleModule,
    ]
})
export class PlayerModule {
}
