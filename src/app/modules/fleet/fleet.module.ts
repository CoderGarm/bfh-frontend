import {NgModule} from '@angular/core';
import {FleetSelectionComponent} from './components/orga/fleet-selection/fleet-selection.component';
import {FleetTabViewComponent} from './components/orga/fleet-tab-view/fleet-tab-view.component';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {FleetDetachmentComponent} from './components/payload/fleet-split/fleet-detachment.component';


@NgModule({
    declarations: [
        FleetSelectionComponent,
        FleetTabViewComponent,
        FleetDetachmentComponent,
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule
    ]
})
export class FleetModule {
}
