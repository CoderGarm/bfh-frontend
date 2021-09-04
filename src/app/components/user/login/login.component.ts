import { JWTRes } from './../../../services/swagger/model/jWTRes';
import { AuthRequest } from './../../../services/swagger/model/authRequest';
import { AuthenticationService } from './../../../services/authentication/authentication.service';

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public static path: string = 'login';

  public loginForm: FormGroup;
  public isAuthenticated: boolean = false;

  constructor(protected authService: AuthenticationService, private permissionsService: NgxPermissionsService) {
    this.loginForm = new FormGroup({
      login: new FormControl(''),
      pass: new FormControl('')
    });
  }

  ngOnInit(): void { }

  submitLogin() {

    const login: AuthRequest = {
      username: this.loginForm.controls.login.value,
      password: this.loginForm.controls.pass.value,
    }

    this.authService.login(login).subscribe(
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

}
