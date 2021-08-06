import { MatButtonModule } from '@angular/material/button';
import { ProfileComponent } from './../user/profile/profile.component';
import { AuthenticationService } from './../../services/authentication/authentication.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  public isLoggedIn: boolean = false;

  constructor(private router: Router, private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    this.authenticationService.getAccessData().subscribe(loggedIn => {
      this.isLoggedIn = !!loggedIn;
      if (this.isLoggedIn) {
        console.log("logged in");
        this.router.navigateByUrl(ProfileComponent.path);
      }
    });

    console.log("nav component on init");
  }

  public logout() {
    console.log('logout');
    this.isLoggedIn = false;
    this.authenticationService.logout();
  }
}
