import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {FittingDisplayComponent} from './components/payload/fitting-display/fitting-display.component';
import {FittingSelectionComponent} from './components/payload/fitting-selection/fitting-selection.component';
import {ShipClassSelectionComponent} from './components/orga/ship-class-selection/ship-class-selection.component';
import {ShipClassTabViewComponent} from './components/orga/ship-class-tab-view/ship-class-tab-view.component';
import {ShipClassSvgComponent} from './components/payload/ship-class-svg/ship-class-svg.component';
import {ShipClassNamePatternValidatorDirective} from "../../validators/shipNamePatternValidator";
import {ShipyardEventService} from "./shipyard-event.service";


@NgModule({
    declarations: [
        FittingDisplayComponent,
        FittingSelectionComponent,
        ShipClassSelectionComponent,
        ShipClassTabViewComponent,
        ShipClassSvgComponent,
        ShipClassNamePatternValidatorDirective
    ],
    exports: [
        ShipClassSelectionComponent
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
