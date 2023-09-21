import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {AllianceTabViewComponent} from './components/orga/alliance-tab-view/alliance-tab-view.component';
import {AllianceListComponent} from './components/payload/alliance-list/alliance-list.component';
import {AllianceForumComponent} from './components/payload/alliance-forum/alliance-forum.component';
import {AllianceDashboardComponent} from './components/payload/alliance-dashboard/alliance-dashboard.component';
import {ForumModule} from "../forum/forum.module";
import {MembersListComponent} from './components/payload/members-list/members-list.component';
import {AllianceCreateComponent} from "./components/payload/alliance-create/alliance-create.component";
import {AllianceCodeValidatorDirective, AllianceNameValidatorDirective} from "./validators/alliance.validator";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {AllianceNotificationService} from "./alliance-notification.service";


@NgModule({
    declarations: [
        AllianceNameValidatorDirective,
        AllianceCodeValidatorDirective,
        AllianceTabViewComponent,
        AllianceListComponent,
        AllianceForumComponent,
        AllianceDashboardComponent,
        MembersListComponent,
        AllianceCreateComponent
    ],
    imports: [
        SharedModuleModule,
        ForumModule,
        DisplayElementsModule,
    ],
    providers: [
        AllianceNotificationService,
    ]
})
export class AllianceModule {
}
