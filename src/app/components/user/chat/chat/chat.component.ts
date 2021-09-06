import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  public static path : string = 'chat';

  @Input()
  public typed?: string;

  constructor() { }

  ngOnInit(): void {
    console.log(this.typed);
  }

}
