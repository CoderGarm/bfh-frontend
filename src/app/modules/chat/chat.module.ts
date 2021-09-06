import { ChatListComponent } from '../../components/user/chat/chat-list/chat-list.component';
import { ChatComponent } from '../../components/user/chat/chat/chat.component';
import { NgModule } from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";

@NgModule({
  declarations: [ChatComponent, ChatListComponent],
  imports: [
    SharedModuleModule
  ]
})
export class ChatModule { }
