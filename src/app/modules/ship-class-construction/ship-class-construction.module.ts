import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {ShipClassViewComponent} from './components/ship-class-view/ship-class-view.component';
import {FittingDisplayComponent} from './components/fitting-display/fitting-display.component';
import {FittingSelectionComponent} from './components/fitting-selection/fitting-selection.component';
import {ShipClassSelectionComponent} from './components/ship-class-selection/ship-class-selection.component';
import {ShipClassMainComponent} from './components/ship-class-main/ship-class-main.component';
import {ShipClassSvgComponent} from './components/ship-class-svg/ship-class-svg.component';
import {ShipClassNamePatternValidatorDirective} from "../../validators/shipNamePatternValidator";


@NgModule({
    declarations: [
        ShipClassViewComponent,
        FittingDisplayComponent,
        FittingSelectionComponent,
        ShipClassSelectionComponent,
        ShipClassMainComponent,
        ShipClassSvgComponent,
        ShipClassNamePatternValidatorDirective
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule
    ]
})
export class ShipClassConstructionModule {
}
