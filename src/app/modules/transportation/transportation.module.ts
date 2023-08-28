import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {TransportTabViewComponent} from './orga/transport-tab-view/transport-tab-view.component';
import {TransportResourcesComponent} from './payload/components/transport-resources/transport-resources.component';
import {ResourceCarrierComponent} from './payload/components/transportation-resource-demand/resource-carrier.component';
import {HumansCarrierComponent} from './payload/components/transportation-humans-demand/humans-carrier.component';


@NgModule({
    declarations: [
        TransportTabViewComponent,
        TransportResourcesComponent,
        ResourceCarrierComponent,
        HumansCarrierComponent,
    ],
    exports: [],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
    ]
})
export class TransportationModule {
}
