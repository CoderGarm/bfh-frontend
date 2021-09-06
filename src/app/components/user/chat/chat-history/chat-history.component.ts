import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ChatApiService, UserJsonRes} from "../../../../services/swagger";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";
import {Observable, Subscription} from "rxjs";
import {ChatHistory} from "../../../../services/swagger/model/chatHistory";
import {ChatUser} from "../../../../services/swagger/model/chatUser";

@Component({
  selector: 'app-chat-history',
  templateUrl: './chat-history.component.html',
  styleUrls: ['./chat-history.component.scss']
})
export class ChatHistoryComponent implements OnInit, OnChanges {

  public chatHistory?: ChatHistory;
  private subscription?: Subscription;

  @Input()
  public user?: UserJsonRes;

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "data" changed
    if (changes['user']) {
      let userID: number = this.tokenStorage.getUserID();
      if (!!userID && !!this.user && !!this.user.idUser) {
        this.subscription = this.chatApi.getChatByUsers(this.user.idUser, userID).subscribe(resp => this.chatHistory = resp);
      }
    }
  }

  constructor(private chatApi: ChatApiService, private tokenStorage: TokenStorage) {
  }

  chooseStyleFromSender(sender: ChatUser): string {
    let userID: number = this.tokenStorage.getUserID();
    if (sender.idUser === userID) {
      return "set-right";
    }
    return "set-left";
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (!!this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}
