import { JWTRes } from './../../../services/swagger/model/jWTRes';
import { AuthRequest } from './../../../services/swagger/model/authRequest';
import { AuthenticationService } from './../../../services/authentication/authentication.service';

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NgxPermissionsService } from 'ngx-permissions';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public static path: string = 'login';

  private subscription?: Subscription;

  public loginForm: FormGroup;
  public isAuthenticated: boolean = false;

  constructor(protected authService: AuthenticationService, private permissionsService: NgxPermissionsService) {
    this.loginForm = new FormGroup({
      login: new FormControl('flashkid'),
      pass: new FormControl('12457aA!')
    });
  }

  ngOnInit(): void { }

  submitLogin() {

    const login: AuthRequest = {
      username: this.loginForm.controls.login.value,
      password: this.loginForm.controls.pass.value,
    }

    this.subscription = this.authService.login(login).subscribe(
      resp => {
        this.isAuthenticated = !!resp;
      },
      error => {
        console.log("auth error");
        this.clear();
      }
    );

  }


  clear() {

    this.authService.clear();
    this.permissionsService.flushPermissions();

    this.loginForm = new FormGroup({
      login: new FormControl(''),
      pass: new FormControl('')
    });
  }

  ngOnDestroy() {
    if (!!this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
