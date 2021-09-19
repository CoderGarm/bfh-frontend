import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ChatApiService, ChatHistory, ChatMessage, UserJson} from "../../../../services/swagger";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {Subscription} from "rxjs";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-chat-history',
  templateUrl: './chat-history.component.html',
  styleUrls: ['./chat-history.component.scss']
})
export class ChatHistoryComponent implements OnInit, OnChanges {

  /**
   * The current displayed chat history.
   */
  chatHistory?: ChatHistory;

  private subscriptions: Subscription[] = [];

  chatFG: FormGroup = new FormGroup({
    messageFC: new FormControl('')
  })

  /**
   * The user which was selected by the logged in user in order to chat with.
   * And their field name below - which must be the same in order to address the field.
   */
  @Input()
  selectedUserChatHistoryInput?: UserJson;
  private selectedUserDefinition: string = 'selectedUserChatHistoryInput';

  @Output()
  newChatStartedChatHistoryOutput: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private chatApi: ChatApiService, private tokenStorage: TokenStorage) {
  }

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "user" changed
    if (changes[this.selectedUserDefinition]) {
      let userID: number = this.tokenStorage.getUserID();
      if (!!userID && !!this.selectedUserChatHistoryInput && !!this.selectedUserChatHistoryInput.idUser) {
        const subscription = this.chatApi.getChatByUsers(this.selectedUserChatHistoryInput.idUser, userID).subscribe(resp => this.chatHistory = resp);
        this.subscriptions.push(subscription);
      }
    }
  }

  chooseStyleFromSender(sender: UserJson): string {
    let userID: number = this.tokenStorage.getUserID();
    if (sender.idUser === userID) {
      return "chat-card set-right";
    }
    return "chat-card set-left";
  }

  submitMessage() {
    if (!this.selectedUserChatHistoryInput) {
      return;
    }
    // check if this is a new chat or only a new message for an old one
    const idChatHistory: number = !!this.chatHistory?.idChatHistory ? this.chatHistory.idChatHistory : -1;

    const chatMessage: ChatMessage = {
      idUserMessage: this.chatHistory?.idChatHistory,
      message: this.chatFG.controls.messageFC.value,
      sender: {
        idUser: this.tokenStorage.getUserID(),
        username: this.tokenStorage.getLogin()
      },
      sentAt: new Date()
    };

    if (!!idChatHistory && idChatHistory != -1) {
      // add a new message to an old chat
      const sub: Subscription = this.chatApi.sendChatMessage(chatMessage).subscribe(resp => this.chatHistory = resp);
      this.subscriptions.push(sub);
    } else {
      // create a new chat
      const chatHistory: ChatHistory = {
        idChatHistory: idChatHistory,
        userOne: {
          idUser: this.tokenStorage.getUserID(),
          username: this.tokenStorage.getLogin()
        },
        userTwo: this.selectedUserChatHistoryInput!,
        messages: [chatMessage],
      }
      const sub: Subscription = this.chatApi.createChatMessageThread(chatHistory).subscribe(resp => this.chatHistory = resp);
      this.subscriptions.push(sub);
    }
    this.chatFG.controls.messageFC.setValue('');
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  chooseStyleByChat() {
    if (!!this.chatHistory && !!this.chatHistory.messages && this.chatHistory.messages.length > 6) {
      return "chat-card set-right message-field-in-flow";
    } else {
      return "chat-card set-right message-field-on-hold";
    }
  }
}
