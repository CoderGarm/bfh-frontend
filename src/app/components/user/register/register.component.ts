import { Component, OnInit, Type } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  public static path : string = 'register';

  constructor() { }

  ngOnInit(): void {
  }

}
