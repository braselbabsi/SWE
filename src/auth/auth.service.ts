/*
 * Copyright (C) 2016 - 2018 Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {EventEmitter, Inject, Injectable} from '@angular/core'

import {log} from '../shared'

import {BasicAuthService} from './basic-auth.service'
import {CookieService} from './cookie.service'
// import {JwtService} from './jwt.service'

// export const ROLLE_ADMIN = 'admin'
// Spring Security:
export const ROLLE_ADMIN = 'ROLE_ADMIN'

@Injectable()
export class AuthService {
    private isLoggedInEmitter: EventEmitter<boolean> = new EventEmitter<
        boolean
    >()
    private rollenEmitter: EventEmitter<Array<string>> = new EventEmitter<
        Array<string>
    >()

    constructor(
        // @Inject(JwtService) private readonly jwtService: JwtService,
        @Inject(BasicAuthService)
        private readonly basicAuthService: BasicAuthService,
        @Inject(CookieService) private readonly cookieService: CookieService,
    ) {
        console.log('AuthService.constructor()')
    }

    /**
     * @param username als String
     * @param password als String
     * @return void
     */
    @log
    async login(username: string | undefined, password: string | undefined) {
        let rollen: Array<string>
        try {
            console.log('test')
            // this.basicAuthService.login(username, password)
            // rollen = await this.jwtService.login(username, password)
            rollen = await this.basicAuthService.login(username, password)
            console.log('AuthService.login()', rollen)
            this.isLoggedInEmitter.emit(true)
        } catch (e) {
            console.warn('AuthService.login(): Exception', e)
            rollen = []
            this.isLoggedInEmitter.emit(false)
        }

        this.rollenEmitter.emit(rollen)
    }

    /**
     * @return void
     */
    @log
    logout() {
        this.cookieService.deleteAuthorization()
        this.isLoggedInEmitter.emit(false)
        this.rollenEmitter.emit([])
    }

    @log
    observeIsLoggedIn(next: (event: boolean) => void) {
        // Observable.subscribe() aus RxJS liefert ein Subscription Objekt,
        // mit dem man den Request abbrechen ("cancel") kann
        // tslint:disable:max-line-length
        // https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/subscribe.md
        // http://stackoverflow.com/questions/34533197/what-is-the-difference-between-rx-observable-subscribe-and-foreach
        // https://xgrommx.github.io/rx-book/content/observable/observable_instance_methods/subscribe.html
        // tslint:enable:max-line-length
        return this.isLoggedInEmitter.subscribe(next)
    }

    @log
    observeRollen(next: (event: Array<string>) => void) {
        return this.rollenEmitter.subscribe(next)
    }

    /**
     * @return String fuer JWT oder Basic-Authentifizierung
     */
    getAuthorization() {
        return this.cookieService.getAuthorization()
    }

    /**
     * @return true, falls ein User eingeloggt ist; sonst false.
     */
    isLoggedIn() {
        return this.cookieService.getAuthorization() !== undefined
    }

    /**
     * @return true, falls ein User in der Rolle "admin" eingeloggt ist;
     *         sonst false.
     */
    isAdmin() {
        // z.B. 'admin,mitarbeiter'
        const rolesStr = this.cookieService.getRoles()
        if (rolesStr === undefined) {
            return false
        }

        // z.B. ['admin', 'mitarbeiter']
        const rolesArray = rolesStr.split(',')
        console.log('cookie service:', rolesArray)
        return rolesArray !== undefined && rolesArray.includes(ROLLE_ADMIN)
    }

    toString() {
        return 'AuthService'
    }
}
