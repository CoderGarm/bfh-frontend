import { UserJsonRes } from './../../../../services/swagger/model/userJsonRes';
import { UserApiService } from './../../../../services/swagger/api/userApi.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit {

  public users : UserJsonRes[] = [];

  @Input()
  public searchUsername?: Event;

  constructor(private userApi: UserApiService) { }

  // todo databinding sinnvoll so? output to implementing component
  // todo shared module

  ngOnInit(): void {
  }

  openChat(user:any) {
    console.log(user);
  }

  onSearchChange(): void {  
    console.log(this.searchUsername);
  }

}
