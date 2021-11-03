import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {ShipClassSidenavComponent} from './components/orga/ship-class-sidenav/ship-class-sidenav.component';
import {FittingDisplayComponent} from './components/payload/fitting-display/fitting-display.component';
import {FittingSelectionComponent} from './components/payload/fitting-selection/fitting-selection.component';
import {ShipClassSelectionComponent} from './components/orga/ship-class-selection/ship-class-selection.component';
import {ShipClassTabViewComponent} from './components/orga/ship-class-tab-view/ship-class-tab-view.component';
import {ShipClassSvgComponent} from './components/payload/ship-class-svg/ship-class-svg.component';
import {ShipClassNamePatternValidatorDirective} from "../../validators/shipNamePatternValidator";


@NgModule({
    declarations: [
        ShipClassSidenavComponent,
        FittingDisplayComponent,
        FittingSelectionComponent,
        ShipClassSelectionComponent,
        ShipClassTabViewComponent,
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
