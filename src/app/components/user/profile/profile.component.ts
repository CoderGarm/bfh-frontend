import {Component, OnInit} from '@angular/core';
import {TokenStorage} from "../../../services/authentication/token-storage.service";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    static path: string = 'profile';

    role?: string;

    constructor(private tokenStorage: TokenStorage) {
    }

    ngOnInit(): void {

        this.role = this.tokenStorage.getRole();

    }

}
