import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {PlayerPointsListComponent} from './payload/player-points-list/player-points-list.component';
import {PlayerPointsTabViewComponent} from './orga/player-points-tab-view/player-points-tab-view.component';
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {WarHarvest24PointsComponent} from "./payload/war-harvest-24-points/war-harvest-24-points.component";
import {Tournament24PointsComponent} from "./payload/tournament-24/tournament-24-points.component";


@NgModule({
    declarations: [
        PlayerPointsListComponent,
        PlayerPointsTabViewComponent,
        WarHarvest24PointsComponent,
        Tournament24PointsComponent,
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
    ]
})
export class PlayerModule {
}
