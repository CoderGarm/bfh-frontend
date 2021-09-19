import {Component, Input, OnInit} from '@angular/core';
import {UserJson} from "../../../../services/swagger";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  static path: string = 'chat';

  /**
   * The user which was selected by the logged in user in order to chat with.
   */
  @Input()
  selectedUserChatInput?: UserJson;

  /**
   * Event which is fired if a new chat was started in order to update the list of active chats.
   */
  @Input()
  newChatStartedChatInput?: boolean;

  constructor() {
  }

  ngOnInit(): void {
  }

}
