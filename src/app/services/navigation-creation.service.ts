import { HomeComponent } from './../components/home/home.component';
import { ProfileComponent } from './../components/user/profile/profile.component';
import { LoginComponent } from './../components/user/login/login.component';
import { RegisterComponent } from '../components/user/register/register.component';
import { Routes } from '@angular/router';
import { ProtectedGuard, PublicGuard } from 'ngx-auth';


export class NavigationCreationService {

  public static createRoutes(): Routes {

    return [
      { path: HomeComponent.path, component: HomeComponent },
      { path: RegisterComponent.path, component: RegisterComponent },
      { path: LoginComponent.path, component: LoginComponent },
      { path: ProfileComponent.path, component: ProfileComponent, canActivate: [ProtectedGuard] }
    ];
  }
}