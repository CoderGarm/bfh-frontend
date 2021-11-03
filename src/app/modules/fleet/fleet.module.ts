import {NgModule} from '@angular/core';
import {FleetSidenavComponent} from './components/orga/fleet-sidenav/fleet-sidenav.component';
import {FleetSelectionComponent} from './components/orga/fleet-selection/fleet-selection.component';
import {FleetTabViewComponent} from './components/orga/fleet-tab-view/fleet-tab-view.component';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";


@NgModule({
    declarations: [
        FleetSidenavComponent,
        FleetSelectionComponent,
        FleetTabViewComponent,
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule
    ]
})
export class FleetModule {
}
