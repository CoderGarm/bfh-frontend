import {Injectable} from "@angular/core";
import {share, tap} from 'rxjs/operators';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from "@angular/common/http";
import {Observable, of} from "rxjs";

@Injectable()
export class HttpCacheInterceptor implements HttpInterceptor {

    /**
     * <b>Attention:</b> Only for static data please.
     */
    private toCache: string[] = [
        '/api/private/starMap/',
        '/api/private/colonization/all/',
        '/api/private/report/battle/',
        '/api/private/resources/miningFactors/'
    ];

    private cache: Map<string, HttpResponse<any>> = new Map()

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.contains(req.url)) {
            return next.handle(req);
        }

        const cachedResponse: HttpResponse<any> = this.cache.get(req.url)!;
        if (cachedResponse) {
            return of(cachedResponse.clone())
        } else {
            return next.handle(req).pipe(
                tap((stateEvent: any) => {
                    if (stateEvent instanceof HttpResponse) {
                        this.cache.set(req.url, stateEvent.clone())
                    }
                })
            ).pipe(share());
        }
    }

    private contains(url: string): boolean {
        const contains = this.toCache.filter(path => url.includes(path));
        return contains.length > 0;
    }
}