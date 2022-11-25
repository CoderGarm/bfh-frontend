import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {TransportTabViewComponent} from './orga/transport-tab-view/transport-tab-view.component';
import {TransportResourcesComponent} from './payload/transport-resources/transport-resources.component';
import {TransportHumansComponent} from './payload/transport-humans/transport-humans.component';
import {TransportGoodsComponent} from './payload/transport-goods/transport-goods.component';
import {TransportationResourceDemandComponent} from './payload/components/transportation-resource-demand/transportation-resource-demand.component';
import {TransportationResourceDeliveryComponent} from './payload/components/transportation-resource-delivery/transportation-resource-delivery.component';
import {TransportationHumansDemandComponent} from './payload/components/transportation-humans-demand/transportation-humans-demand.component';
import {TransportationHumansDeliveryComponent} from './payload/components/transportation-humans-delivery/transportation-humans-delivery.component';
import {TransportationGoodsDemandComponent} from './payload/components/transportation-goods-demand/transportation-goods-demand.component';
import {TransportationGoodsDeliveryComponent} from './payload/components/transportation-goods-delivery/transportation-goods-delivery.component';


@NgModule({
    declarations: [
        TransportTabViewComponent,
        TransportResourcesComponent,
        TransportHumansComponent,
        TransportGoodsComponent,
        TransportationResourceDemandComponent,
        TransportationResourceDeliveryComponent,
        TransportationHumansDemandComponent,
        TransportationHumansDeliveryComponent,
        TransportationGoodsDemandComponent,
        TransportationGoodsDeliveryComponent,
    ],
    exports: [],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
    ]
})
export class TransportationModule {
}
