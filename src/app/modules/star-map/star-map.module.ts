import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {StarMapTabViewComponent} from './orga/star-map-tab-view/star-map-tab-view.component';
import {StarMapViewComponent} from './payload/star-map-view/star-map-view.component';
import {UniverseMapViewComponent} from './payload/universe-map-view/universe-map-view.component';
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {NotchComponent} from './payload/notch/notch.component';
import {FleetNotchDisplayComponent} from './payload/fleet-notch-display/fleet-notch-display.component';
import {SystemInfoComponent} from './payload/system-info/system-info.component';
import {FleetNotchDisplayListComponent} from './payload/fleet-notch-display-list/fleet-notch-display-list.component';
import {FleetNotchInfoComponent} from './payload/fleet-notch-info/fleet-notch-info.component';
import {FleetNotchMoveComponent} from './payload/fleet-notch-move/fleet-notch-move.component';
import {FleetNotchMergeComponent} from './payload/fleet-notch-merge/fleet-notch-merge.component';
import {FleetNotchTransportComponent} from './payload/fleet-notch-transport/fleet-notch-transport.component';
import {NgxSpinnerModule} from "ngx-spinner";


@NgModule({
    declarations: [
        StarMapTabViewComponent,
        StarMapViewComponent,
        UniverseMapViewComponent,
        NotchComponent,
        FleetNotchDisplayComponent,
        SystemInfoComponent,
        FleetNotchDisplayListComponent,
        FleetNotchInfoComponent,
        FleetNotchMoveComponent,
        FleetNotchMergeComponent,
        FleetNotchTransportComponent,
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
        NgxSpinnerModule
    ]
})
export class StarMapModule {
}
