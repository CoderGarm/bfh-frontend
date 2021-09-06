import { ChatListComponent } from '../../components/user/chat/chat-list/chat-list.component';
import { ChatComponent } from '../../components/user/chat/chat/chat.component';
import { NgModule } from '@angular/core';
import {SharedModuleModule} from "../shared-module/shared-module.module";
import {ChatHistoryComponent} from "../../components/user/chat/chat-history/chat-history.component";
import {CommonModule} from "@angular/common";

@NgModule({
  declarations: [ChatComponent, ChatListComponent, ChatHistoryComponent],
  imports: [
    SharedModuleModule,
  ]
})
export class ChatModule { }
