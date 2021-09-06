import {Component, Input, OnInit} from '@angular/core';
import {UserJsonRes} from "../../../../services/swagger";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  public static path : string = 'chat';

  @Input()
  public selectedUser?: UserJsonRes;

  constructor() { }

  ngOnInit(): void {
  }
}
