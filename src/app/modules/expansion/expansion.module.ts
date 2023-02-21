import {NgModule} from '@angular/core';
import {ExpansionTabViewComponent} from './components/orga/expansion-tab-view/expansion-tab-view.component';
import {OrganizeExpansionComponent} from './components/payload/organize-expansion/organize-expansion.component';
import {SeeExpansionComponent} from './components/payload/see-expansion/see-expansion.component';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {ExpansionManager} from "./expansion.manager";


@NgModule({
    declarations: [
        ExpansionManager,
        ExpansionTabViewComponent,
        OrganizeExpansionComponent,
        SeeExpansionComponent
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule
    ],
    exports: [
        ExpansionManager,
    ]
})
export class ExpansionModule {
}
