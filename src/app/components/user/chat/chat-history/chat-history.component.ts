import {Component, Input, OnInit} from '@angular/core';
import {UserJsonRes} from "../../../../services/swagger";

@Component({
  selector: 'app-chat-history',
  templateUrl: './chat-history.component.html',
  styleUrls: ['./chat-history.component.scss']
})
export class ChatHistoryComponent implements OnInit {

  @Input()
  public typed?: UserJsonRes;

  constructor() { }

  ngOnInit(): void {
  }

}
