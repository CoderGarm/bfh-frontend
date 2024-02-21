import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {FittingDisplayComponent} from './components/payload/fitting-display/fitting-display.component';
import {FittingModifyComponent} from './components/payload/fitting-modify/fitting-modify.component';
import {ShipClassSelectionComponent} from './components/orga/ship-class-selection/ship-class-selection.component';
import {ShipClassTabViewComponent} from './components/orga/ship-class-tab-view/ship-class-tab-view.component';
import {ShipClassNamePatternValidatorDirective} from "../../validators/shipName-pattern.validator";
import {ShipyardEventService} from "./shipyard-event.service";
import {FittingCreateComponent} from './components/payload/fitting-create/fitting-create.component';
import {ShipClassFittingCreateComponent} from "./components/payload/ship-class-fitting-create/ship-class-fitting-create.component";
import {ShipClassFittingModifyComponent} from "./components/payload/ship-class-fitting-modify/ship-class-fitting-modify.component";
import {ShipImagerComponent} from './components/payload/ship-imager/ship-imager.component';


@NgModule({
    declarations: [
        ShipClassFittingCreateComponent,
        ShipClassFittingModifyComponent,
        FittingDisplayComponent,
        FittingModifyComponent,
        ShipClassSelectionComponent,
        ShipClassTabViewComponent,
        ShipClassNamePatternValidatorDirective,
        FittingCreateComponent,
        ShipImagerComponent,
    ],
    exports: [
        ShipClassSelectionComponent,
        ShipClassNamePatternValidatorDirective
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule
    ],
    providers: [
        ShipyardEventService
    ]
})
export class ShipClassConstructionModule {
}
