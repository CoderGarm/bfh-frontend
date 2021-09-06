import { PlanetsComponent } from './../components/planets/planets.component';
import { ChatComponent } from '../components/user/chat/chat/chat.component';
import { HomeComponent } from './../components/home/home.component';
import { ProfileComponent } from './../components/user/profile/profile.component';
import { LoginComponent } from './../components/user/login/login.component';
import { RegisterComponent } from '../components/user/register/register.component';
import { Route, Routes } from '@angular/router';
import { ProtectedGuard, PublicGuard } from 'ngx-auth';


export class NavigationCreationService {

  public static getLoginRoute(): Route {
    return { path: LoginComponent.path, component: LoginComponent };
  }

  public static createRoutes(): Routes {
    return [
      { path: HomeComponent.path, component: HomeComponent },
      { path: RegisterComponent.path, component: RegisterComponent },
      { path: LoginComponent.path, component: LoginComponent },
      { path: ProfileComponent.path, component: ProfileComponent, canActivate: [ProtectedGuard] },
      { path: ChatComponent.path, component: ChatComponent, canActivate: [ProtectedGuard] },
      { path: PlanetsComponent.path, component: PlanetsComponent, canActivate: [ProtectedGuard] },
    ];
  }

  public static createNavDrawerRoutes(): Routes {
    return [      
      { path: ChatComponent.path, component: ChatComponent, canActivate: [ProtectedGuard] },
      { path: PlanetsComponent.path, component: PlanetsComponent, canActivate: [ProtectedGuard] },
    ];
  }
}