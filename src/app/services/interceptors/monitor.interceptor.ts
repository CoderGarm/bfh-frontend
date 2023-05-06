import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {finalize} from "rxjs/operators";
import {TokenStorage} from "../authentication/token-storage.service";

@Injectable()
export class MonitorInterceptor implements HttpInterceptor {

    private readonly isLocalhost: boolean = false;

    constructor(private tokenStorage: TokenStorage) {
        this.isLocalhost = this.tokenStorage.isLocalhost();
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const begin = performance.now();
        return next.handle(request).pipe(
            finalize(() => {
                this.logRequestTime(begin, request.url, request.method);
            })
        );
    }

    private logRequestTime(startTime: number, url: string, method: string) {
        if (this.isLocalhost) {
            let requestDuration = performance.now() - startTime;
            requestDuration = Math.round(requestDuration / 1000);
            if (requestDuration > 1.1) {
                console.warn(`HTTP ${method} ${url} - ${requestDuration} seconds`);
            }
        }
    }
}
