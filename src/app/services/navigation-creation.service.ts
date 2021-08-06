import { LoginComponent } from './../components/user/login/login.component';
import { RegisterComponent } from '../components/user/register/register.component';
import { Routes } from '@angular/router';


export class NavigationCreationService {

  public static createRoutes(): Routes {

    return [
      { path: 'register', component: RegisterComponent },
      { path: 'login', component: LoginComponent },
    ];
  }
}