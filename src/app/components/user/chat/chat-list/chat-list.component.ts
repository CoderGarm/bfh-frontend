import { UserJsonRes } from '../../../../services/swagger';
import { UserApiService } from '../../../../services/swagger';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit {

  public users : UserJsonRes[] = [];

  @Input()
  public searchUsername?: string;

  @Output()
  public selectedUser: EventEmitter<UserJsonRes>  = new EventEmitter<UserJsonRes>();

  constructor(private userApi: UserApiService) { }

  ngOnInit(): void {
  }

  openChat(user:UserJsonRes) {
    this.selectedUser.emit(user!);
  }

  onSearchChange(): void {
    if (!!this.searchUsername) {
      this.userApi.getUsersByLikeUserName(this.searchUsername).subscribe(resp => this.users = resp);
    } else {
      this.users = [];
    }
  }

}
