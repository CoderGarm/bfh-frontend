import {ChatListComponent} from './components/chat-list/chat-list.component';
import {ChatComponent} from './components/chat/chat.component';
import {NgModule} from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {ChatHistoryComponent} from "./components/chat-history/chat-history.component";

@NgModule({
  declarations: [ChatComponent, ChatListComponent, ChatHistoryComponent],
  imports: [
    SharedModuleModule,
  ]
})
export class ChatModule {
}
