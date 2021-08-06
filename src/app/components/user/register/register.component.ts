import { PasswordErrorMessages } from './../../../validators/passwordValidator';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Type } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  public static path: string = 'register';

  errors = PasswordErrorMessages;
  public registerForm: FormGroup;

  constructor() {
    this.registerForm = new FormGroup({
      login: new FormControl('', Validators.required),
      pass: new FormControl('', [Validators.required]),
      passRepeat: new FormControl('', Validators.required),
      email: new FormControl('', Validators.email)
    });
  }

  ngOnInit(): void {
  }


  public submitRegister(): void {
    console.log("create user")
  }

  public clear(): void {

  }

}
