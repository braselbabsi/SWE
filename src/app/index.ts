/*
 * Copyright (C) 2015 - 2018 Juergen Zimmermann, Hochschule Karlsruhe
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

// fuer die Produktion
// import {enableProdMode} from '@angular/core'
import {VERSION} from '@angular/core'
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic'
import * as _ from 'lodash'
import * as moment from 'moment'

import './app.css'

// Konfiguration des Routings fuer die Komponente "App":
// Bookmarks, Refresh der aktuellen Seite, ...
import {AppModule} from './app.module'

const isEs2018Supported = () => {
    try {
        // tslint:disable-next-line:no-eval
        eval('const foo = {bar: 0}; const {bar} = foo;')
    } catch (err) {
        console.error('ES 2018 wird durch den Webbrowser NICHT unterstuetzt.')
        return
    }
    console.info('ES 2018 wird durch den Webbrowser unterstuetzt.')
}
isEs2018Supported()

// Fuer die Produktion
// enableProdMode()

const bootstrap = async () => {
    try {
        // dynamisches Bootstrapping, d.h. Just-In-Time Compiler (JIT) aufrufen
        // Start des "Root-Moduls" als Einstiegspunkt in die Webanwendung
        await platformBrowserDynamic().bootstrapModule(AppModule)
    } catch (err) {
        console.error('Das Bootstrapping fuer Angular ist fehlgeschlagen:', err)
        return
    }

    console.info(`Angular ${VERSION.full}: Bootstrapping ist abgeschlossen`)
    console.info(`lodash ${_.VERSION}`)
    console.info(`Moment ${moment.version}`)
}
bootstrap()
