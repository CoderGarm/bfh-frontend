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
  public selectedValue: EventEmitter<string>  = new EventEmitter<string>();

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
    this.selectedValue.emit(this.searchUsername!);
  }

}
