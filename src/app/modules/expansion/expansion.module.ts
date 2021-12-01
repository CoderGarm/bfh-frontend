import {NgModule} from '@angular/core';
import {ExpansionTabViewComponent} from './components/orga/expansion-tab-view/expansion-tab-view.component';
import {OrganizeExpansionComponent} from './components/payload/organize-expansion/organize-expansion.component';
import {SeeExpansionComponent} from './components/payload/see-expansion/see-expansion.component';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";


@NgModule({
    declarations: [
        ExpansionTabViewComponent,
        OrganizeExpansionComponent,
        SeeExpansionComponent
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule
    ]
})
export class ExpansionModule {
}
