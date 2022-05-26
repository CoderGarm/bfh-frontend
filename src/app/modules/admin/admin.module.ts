import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {AdminPageComponent} from './components/admin-page/admin-page.component';


@NgModule({
    declarations: [
        AdminPageComponent
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule
    ]
})
export class AdminModule {
}
