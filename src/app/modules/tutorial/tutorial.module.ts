import {NgModule} from '@angular/core';
import {TopicSelectorComponent} from './topic-selector/topic-selector.component';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {DisplayElementsModule} from "../display-elements/display-elements.module";
import {TutorialDisplayComponent} from "./tutorial-display/tutorial-display.component";
import {FleetDashComponent} from './topics/journalTabView/fleet-dash/fleet-dash.component';


@NgModule({
    declarations: [
        TopicSelectorComponent,
        TutorialDisplayComponent,
        FleetDashComponent,
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
    ]
})
export class TutorialModule {
}
