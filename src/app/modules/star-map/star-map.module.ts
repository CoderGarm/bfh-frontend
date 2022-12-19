import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {StarMapTabViewComponent} from './orga/star-map-tab-view/star-map-tab-view.component';
import {StarMapViewComponent} from './payload/star-map-view/star-map-view.component';
import {UniverseMapViewComponent} from './payload/universe-map-view/universe-map-view.component';
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {NotchComponent} from './payload/notch/notch.component';
import {FleetNotchDisplayComponent} from './payload/fleet-notch-display/fleet-notch-display.component';


@NgModule({
    declarations: [
        StarMapTabViewComponent,
        StarMapViewComponent,
        UniverseMapViewComponent,
        NotchComponent,
        FleetNotchDisplayComponent
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule
    ]
})
export class StarMapModule {
}
