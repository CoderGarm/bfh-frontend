import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {TransportTabViewComponent} from './orga/transport-tab-view/transport-tab-view.component';
import {TransportResourcesComponent} from './payload/components/transport-resources/transport-resources.component';
import {TransportHumansComponent} from './payload/components/transport-humans/transport-humans.component';
import {TransportationResourceDemandComponent} from './payload/components/transportation-resource-demand/transportation-resource-demand.component';
import {TransportationResourceDeliveryComponent} from './payload/components/transportation-resource-delivery/transportation-resource-delivery.component';
import {TransportationHumansDemandComponent} from './payload/components/transportation-humans-demand/transportation-humans-demand.component';
import {TransportationHumansDeliveryComponent} from './payload/components/transportation-humans-delivery/transportation-humans-delivery.component';


@NgModule({
    declarations: [
        TransportTabViewComponent,
        TransportResourcesComponent,
        TransportHumansComponent,
        TransportationResourceDemandComponent,
        TransportationResourceDeliveryComponent,
        TransportationHumansDemandComponent,
        TransportationHumansDeliveryComponent,
    ],
    exports: [],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
    ]
})
export class TransportationModule {
}
