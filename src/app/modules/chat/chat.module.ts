import { FormsModule } from '@angular/forms';
import { ChatListComponent } from './../../components/user/chat/chat-list/chat-list.component';
import { ChatComponent } from '../../components/user/chat/chat/chat.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialComponentsModule } from '../material.module';



@NgModule({
  declarations: [ChatComponent, ChatListComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialComponentsModule
  ]
})
export class ChatModule { }
