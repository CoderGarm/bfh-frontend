import { FrontendError } from './swagger/model/frontendError';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';

import { Router } from '@angular/router';
import { ErrorHandler, EventEmitter, Injectable } from '@angular/core';
import { ErrorDialogComponent } from '../components/error-dialog/error-dialog.component';
import { AuthenticationService } from './authentication';
import { TokenStorage } from './authentication/token-storage.service';

@Injectable()
export class CustomErrorHandler implements ErrorHandler {


    constructor(private dialog: MatDialog, private authService: AuthenticationService, private tokenStorage: TokenStorage, private router: Router) { }

    errorOccurred: EventEmitter<FrontendError> = new EventEmitter();

    navigateToLandingPage(role: number) {
        switch (role) {
          case 1:
            this.router.navigateByUrl('/pinsuche');
            break;
          case 2:
            this.router.navigateByUrl('/artikelsuche');
            break;
          case 4:
            this.router.navigateByUrl('/admin');
            break;
          case 256:
            this.router.navigateByUrl('/admin');
            break;
          default:
            break;
        }
      }

    handleError(receivedError: any) {

        if (!!receivedError) {
            console.log(receivedError);
            const dialogConfig = new MatDialogConfig();

            const errorData: FrontendError = {};

            if (receivedError.status == 500) {
              errorData.message = receivedError.statusText;
            } 
            else if (!receivedError.error && receivedError.stack && receivedError.message) {
                errorData.message = receivedError.message ;
            }
            else if (receivedError.error.code == null || receivedError.error.message == null) {
                errorData.message = "server not reachable - try it later or write to support@etcgmbh.de";
            } else {

                if(receivedError.error.code == 403) {
                    // todo 
                    this.tokenStorage.getRole().subscribe(role => {
                        this.navigateToLandingPage(Number.parseInt(role));
                      });
                }
                errorData.message = receivedError.error.message;
                
                if (!!receivedError.error.validationResults) {
                    errorData.validationResults = receivedError.error.validationResults;
                }

            }

            dialogConfig.data = errorData;
            console.log(errorData);
            this.dialog.open(ErrorDialogComponent, dialogConfig);
        }

    }
}