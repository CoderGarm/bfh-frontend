import {UserJsonRes} from '../../../../services/swagger';
import {UserApiService} from '../../../../services/swagger';
import {AfterViewInit, Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {Subscription} from "rxjs";
import {TokenStorage} from "../../../../services/authentication/token-storage.service";

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements AfterViewInit {

  public users: UserJsonRes[] = [];

  private subscription?: Subscription;

  @Input()
  public searchUsername?: string;

  @Output()
  public selectedUser: EventEmitter<UserJsonRes> = new EventEmitter<UserJsonRes>();

  constructor(private userApi: UserApiService,
              private tokenStorage: TokenStorage) {
  }

  ngAfterViewInit(): void {
  }

  openChat(user: UserJsonRes) {
    this.selectedUser.emit(user!);
  }

  // todo how to remove the error?
  onSearchChange(): void {
    if (!!this.searchUsername) {
      this.subscription = this.userApi.getUsersByLikeUserName(this.searchUsername).subscribe(resp => {
        let loggedInUserID = this.tokenStorage.getUserID();
        let find: UserJsonRes | undefined = resp.find(x => x.idUser == loggedInUserID);
        if (!!find) {
          resp.splice(resp.indexOf(find), 1);
        }
        this.users = resp
      });
    } else {
      this.users = [];
    }
  }

  ngOnDestroy() {
    if (!!this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
