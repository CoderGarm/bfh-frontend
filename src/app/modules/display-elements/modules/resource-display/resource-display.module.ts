import {NgModule} from '@angular/core';
import {ResourceServiceComponent} from "./components/resource-service/resource-service.component";
import {ResourceDisplayComponent} from "./components/resource-display/resource-display.component";
import {ResourceDisplayDialogComponent} from "./components/resource-display-dialog/resource-display-dialog.component";
import {SharedModuleModule} from "../../../shared-module/shared-module.module";
import {ResourceDisplayManager} from "./ResourceDisplayManager";
import {ResourceEmitterService} from "../../../../services/resource-emitter.service";


@NgModule({
    declarations: [
        ResourceDisplayManager,
        ResourceServiceComponent,
        ResourceDisplayComponent,
        ResourceDisplayDialogComponent,
    ],
    imports: [
        SharedModuleModule,
    ],
    providers: [
        ResourceEmitterService,
    ],
    exports: [
        ResourceDisplayManager,
        ResourceServiceComponent,
        ResourceDisplayComponent,
        ResourceDisplayDialogComponent,
    ]
})
export class ResourceDisplayModule {
}
