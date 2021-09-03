import { AuthenticationService, LoginRequest } from './../../../services/authentication/authentication.service';

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
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


  setPermissionsByRole(role: number) {

    let permissions: string[] = [];

    switch (role) {
      case 1:
        permissions.push("ZNL");
        break;
      case 2:
        permissions.push("BUSINESS");
        break;
      case 4:
        permissions.push("ADMINISTRATOR");
        break;
      case 256:
        permissions.push("SUPERUSER");
        break;
      default:
        permissions.push("GUEST");
        break;
    }

    this.permissionsService.loadPermissions(permissions);

  }

  submitLogin() {

    const login: LoginRequest = {
      login: this.loginForm.controls.login.value,
      password: this.loginForm.controls.pass.value,
    }

    this.authService.login(login).subscribe(
      resp => {
        this.isAuthenticated = !!resp;
      },
      error => {
        console.log("auth error");
        this.clear();
        this.setPermissionsByRole(0);
      }
    );

  }


  clear() {

    this.authService.clear();

    this.loginForm = new FormGroup({
      login: new FormControl(''),
      pass: new FormControl('')
    });
  }

}
