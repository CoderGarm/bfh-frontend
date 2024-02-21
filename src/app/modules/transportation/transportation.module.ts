import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {TransportMainViewComponent} from './orga/transport-tab-view/transport-main-view.component';
import {TransportResourcesComponent} from './payload/components/transport-resources/transport-resources.component';
import {ResourceCarrierComponent} from './payload/components/transportation-resource-demand/resource-carrier.component';
import {HumansCarrierComponent} from './payload/components/transportation-humans-demand/humans-carrier.component';
import {PlanetaryHumanCarrierComponent} from './payload/components/planetary-human-carrier/planetary-human-carrier.component';
import {PlanetaryResourceCarrierComponent} from "./payload/components/planetary-resource-carrier/planetary-resource-carrier.component";


@NgModule({
    declarations: [
        TransportMainViewComponent,
        TransportResourcesComponent,
        ResourceCarrierComponent,
        HumansCarrierComponent,
        PlanetaryResourceCarrierComponent,
        PlanetaryHumanCarrierComponent,
    ],
    exports: [],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
    ]
})
export class TransportationModule {
}
