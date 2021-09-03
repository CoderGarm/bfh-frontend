import { CustomErrorHandler } from './../../../services/customErrorHandler.service';
import { UserJsonReq } from './../../../services/swagger/model/userJsonReq';
import { UserApiService } from './../../../services/swagger/api/userApi.service';
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

  constructor(private userApiService : UserApiService) {
    this.registerForm = new FormGroup({
      login: new FormControl('fds', Validators.required), // todo validate username - good for error component check
      pass: new FormControl('12457aA!', [Validators.required]),
      passRepeat: new FormControl('12457aA!', Validators.required),
      email: new FormControl('k@k', Validators.email)
    });
  }

  ngOnInit(): void {
  }


  public submitRegister(): void {
    let newUser : UserJsonReq = {
      email: this.registerForm.controls.email.value,
      password: this.registerForm.controls.pass.value,
      username: this.registerForm.controls.login.value  
    };
    this.userApiService.createUser(newUser).subscribe(
      resp => console.log(resp)           
    );
  }

  public clear(): void {
    this.registerForm.controls.login.setValue('');
    this.registerForm.controls.pass.setValue('');
    this.registerForm.controls.passRepeat.setValue('');
    this.registerForm.controls.email.setValue('');
  }

}
