import {PlanetsComponent} from '../modules/planets/components/planets/planets.component';
import {ChatComponent} from '../modules/chat/components/chat/chat.component';
import {HomeComponent} from './../components/home/home.component';
import {ProfileComponent} from './../components/user/profile/profile.component';
import {LoginComponent} from './../components/user/login/login.component';
import {RegisterComponent} from '../components/user/register/register.component';
import {Route, Routes} from '@angular/router';
import {ProtectedGuard} from 'ngx-auth';
import {StarMapComponent} from "../modules/star-map/star-map/star-map.component";
import {ResearchViewComponent} from "../modules/research/components/research-view/research-view.component";
import {ShipClassViewComponent} from "../modules/ship-class-construction/components/ship-class-view/ship-class-view.component";


export class NavigationCreationService {

  static getLoginRoute(): Route {
    return {path: LoginComponent.path, component: LoginComponent};
  }

  static createRoutes(): Routes {
    return [
      {path: HomeComponent.path, component: HomeComponent},
      {path: RegisterComponent.path, component: RegisterComponent},
      {path: LoginComponent.path, component: LoginComponent},
      {path: ProfileComponent.path, component: ProfileComponent, canActivate: [ProtectedGuard]},
      {path: ChatComponent.path, component: ChatComponent, canActivate: [ProtectedGuard]},
      {path: PlanetsComponent.path, component: PlanetsComponent, canActivate: [ProtectedGuard]},
      {path: StarMapComponent.path, component: StarMapComponent, canActivate: [ProtectedGuard]},
      {path: ResearchViewComponent.path, component: ResearchViewComponent, canActivate: [ProtectedGuard]},
      {path: ShipClassViewComponent.path, component: ShipClassViewComponent, canActivate: [ProtectedGuard]},
    ];
  }

  static createNavDrawerRoutes(): Routes {
    return [
      {path: ChatComponent.path, component: ChatComponent, canActivate: [ProtectedGuard]},
      {path: PlanetsComponent.path, component: PlanetsComponent, canActivate: [ProtectedGuard]},
      {path: StarMapComponent.path, component: StarMapComponent, canActivate: [ProtectedGuard]},
      {path: ResearchViewComponent.path, component: ResearchViewComponent, canActivate: [ProtectedGuard]},
      {path: ShipClassViewComponent.path, component: ShipClassViewComponent, canActivate: [ProtectedGuard]},
    ];
  }
}
