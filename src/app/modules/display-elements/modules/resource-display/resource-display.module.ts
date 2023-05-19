import {NgModule} from '@angular/core';
import {ResourceDisplayComponent} from "./components/resource-display/resource-display.component";
import {SharedModuleModule} from "../../../shared-module/shared-module.module";


@NgModule({
    declarations: [
        ResourceDisplayComponent,
    ],
    imports: [
        SharedModuleModule,
    ],
    exports: [
        ResourceDisplayComponent,
    ]
})
export class ResourceDisplayModule {
}
