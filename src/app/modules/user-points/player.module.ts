import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {PlayerPointsListComponent} from './player-points-list/player-points-list.component';


@NgModule({
    declarations: [
        PlayerPointsListComponent
    ],
    imports: [
        SharedModuleModule,
    ]
})
export class PlayerModule {
}
