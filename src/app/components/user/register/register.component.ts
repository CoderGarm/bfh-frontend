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

  constructor(/* private errorHandler: CustomErrorHandler, */ private userApiService : UserApiService) {
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
    console.log("create user");
    let newUser : UserJsonReq = {
      email: this.registerForm.controls.email.value,
      password: this.registerForm.controls.pass.value,
      username: this.registerForm.controls.login.value  
    };
    console.log(newUser);
    this.userApiService.createUser(newUser).subscribe(
      resp => console.log(resp),
      //error => this.errorHandler.handleError(error)            
    );
  }

  public clear(): void {
    this.registerForm.controls.login.setValue('');
    this.registerForm.controls.pass.setValue('');
    this.registerForm.controls.passRepeat.setValue('');
    this.registerForm.controls.email.setValue('');
  }

}
