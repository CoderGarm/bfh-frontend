import {AuthApiService, UserApiService, UserReq} from '../../../services/swagger';
import {PasswordErrorMessages} from '../../../validators/passwordValidator';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  static path: string = 'register';

  private subscription?: Subscription;

  errors = PasswordErrorMessages;
  registerForm: FormGroup;

  constructor(private userApiService : UserApiService, private authService: AuthApiService) {
    this.registerForm = new FormGroup({
      login: new FormControl('fds', Validators.required), // todo validate username - good for error component check
      pass: new FormControl('12457aA!', [Validators.required]),
      passRepeat: new FormControl('12457aA!', Validators.required),
      email: new FormControl('k@k', Validators.email)
    });
  }

  ngOnInit(): void {
  }


  submitRegister(): void {
    let newUser: UserReq = {
      email: this.registerForm.controls.email.value,
      password: this.registerForm.controls.pass.value,
      username: this.registerForm.controls.login.value
    };
    this.subscription = this.authService.createUser(newUser).subscribe(
        resp => console.log(resp) // todo login created user
    );
  }

  clear(): void {
    this.registerForm.controls.login.setValue('');
    this.registerForm.controls.pass.setValue('');
    this.registerForm.controls.passRepeat.setValue('');
    this.registerForm.controls.email.setValue('');
  }

  ngOnDestroy() {
    if (!!this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
