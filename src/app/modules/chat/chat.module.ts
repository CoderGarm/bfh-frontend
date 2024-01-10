import {ChatSelectionListComponent} from './components/chat-selection-list/chat-selection-list.component';
import {ChatComponent} from './components/chat/chat.component';
import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {ChatHistoryComponent} from "./components/chat-history/chat-history.component";
import {DisplayElementsModule} from "../display-elements/display-elements.module";

@NgModule({
    declarations: [
        ChatComponent,
        ChatSelectionListComponent,
        ChatHistoryComponent
    ],
    imports: [
        SharedModuleModule,
        DisplayElementsModule,
    ]
})
export class ChatModule {
}
