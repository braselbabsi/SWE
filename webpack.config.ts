/*
 * Copyright (C) 2017 - 2018 Juergen Zimmermann, Fabian Hinz, Gabriel Pollak
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

/* global require, module, __dirname */

import * as fs from 'fs'
import * as path from 'path'
// https://github.com/webpack/webpack
import * as webpack from 'webpack'

// http://github.com/kevlened/copy-webpack-plugin
import * as CopyWebpackPlugin from 'copy-webpack-plugin'
// TODO webpack 4: https://github.com/webpack-contrib/mini-css-extract-plugin
// http://github.com/webpack-contrib/extract-text-webpack-plugin
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
// http://github.com/jantimon/html-webpack-plugin
import * as HtmlWebpackPlugin from 'html-webpack-plugin'
// https://github.com/lodash/lodash-webpack-plugin
import * as LodashModuleReplacementPlugin from 'lodash-webpack-plugin'
// https://github.com/hawkins/prettier-webpack-plugin
// import * as PrettierPlugin from 'prettier-webpack-plugin'
// https://github.com/th0r/webpack-bundle-analyzer
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer'

// https://github.com/webpack/docs/wiki/configuration
// https://angular.io/docs/ts/latest/guide/webpack.html
// https://toddmotto.com/lazy-loading-angular-code-splitting-webpack
module.exports = {
    // Strategie, um Sourcemaps zu erzeugen
    devtool: 'source-map',

    // Einstiegspunkt, um Abhaengigkeiten zu analysieren und Loader aufzurufen
    entry: {
        polyfills: './src/webpack/polyfills.ts',
        angular: './src/webpack/angular.ts',
        bootstrap: './src/webpack/bootstrap.ts',
        chartjs: './src/webpack/chartjs.ts',
        lodash: './src/webpack/lodash.ts',
        moment: './src/webpack/moment.ts',
        app: './src/app/index.ts',
    },

    // Pfad und Name(n) der Ausgabedateien: passend zu entry (s.o.)
    output: {
        path: path.resolve(__dirname, 'dist'),
        // polyfills.ts, angular.ts, ..., app.ts
        filename: '[name].js',
    },

    // Zuordnung der zu bearbeitenden Dateien zu einem Loader und
    // Konfiguration der Loader
    module: {
        // Regeln fuer das Laden von Dateitypen
        rules: [
            {
                // Source-Maps fuer uebersetzte JavaScript-Dateien
                enforce: 'pre',
                test: /\.(js|css)$/,
                // http://github.com/webpack-contrib/source-map-loader
                use: ['source-map-loader'],
                exclude: [/node_modules/],
            },

            // {
            //     enforce: 'pre',
            //     test: /\.ts$/,
            //     // https://github.com/wbuchwalter/tslint-loader
            //     loader: 'tslint-loader',
            //     options: {
            //         configFile: 'tslint.yml',
            //         failOnHint: true,
            //         typeCheck: true,
            //     },
            //     exclude: [/node_modules/],
            // },

            {
                test: /\.ts$/,
                // https://github.com/s-panferov/awesome-typescript-loader
                // https://github.com/TypeStrong/ts-loader
                // http://github.com/TheLarkInn/angular2-template-loader
                loaders: [
                    'awesome-typescript-loader',
                    'angular2-template-loader',
                ],
                exclude: [/node_modules/],
            },

            {
                // HTML-Fragmente fuer Komponenten in Angular
                test: /\.html$/,
                // http://github.com/webpack-contrib/html-loader
                loaders: 'html-loader',
            },

            {
                // Sass-Dateien fuer styleUrls in Komponenten in Angular
                test: /\.scss$/,
                // http://github.com/gajus/to-string-loader
                // http://github.com/webpack-contrib/css-loader
                // http://github.com/webpack-contrib/sass-loader
                loaders: ['to-string-loader', 'css-loader', 'sass-loader'],
            },

            {
                // CSS-Dateien fuer styleUrls in Komponenten in Angular
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    // http://github.com/webpack-contrib/style-loader
                    fallback: 'style-loader',
                    use: 'css-loader',
                }),
            },

            // ab webpack 4 statt extract-text-webpack-plugin
            // https://github.com/webpack-contrib/mini-css-extract-plugin#configuration
            // {
            //     // CSS-Dateien fuer styleUrls in Komponenten in Angular
            //     test: /\.(scss)$/,
            //     use: [
            //         MiniCssExtractPlugin.loader,
            //         {
            //             loader: 'css-loader',
            //         },
            //         {
            //             loader: 'sass-loader',
            //             options: {
            //                 sourceMap: true,
            //                 precision: 8,
            //                 // data: `${ENV}: PRODUCTION`,
            //             },
            //         },
            //     ],
            // },

            // {
            //     test: /\.(png|jpe?g|gif|ico)$/,
            //     // http://github.com/webpack-contrib/file-loader
            //     loader: 'file-loader?name=assets/[name].[hash].[ext]',
            // },
        ],
    },

    // Zulaessige Endungen bei "import"
    resolve: {
        extensions: ['.ts', '.js', '.scss', '.css', '.html'],
    },

    plugins: [
        // Abbruch im Fehlerfall
        new webpack.NoEmitOnErrorsPlugin(),

        // Anwendung gemaess der "entry"-Points (s.o.) in Chunks aufsplitten
        // @ts-ignore
        new webpack.optimize.CommonsChunkPlugin({
            name: [
                'app',
                'shared',
                'moment',
                'lodash',
                'chartjs',
                'bootstrap',
                'angular',
                'polyfills',
            ],
        }),

        new webpack.LoaderOptionsPlugin({
            options: {
                tslintLoader: {
                    emitErrors: true,
                    failOnHint: true,
                },
            },
        }),

        // Module nachladen: jQuery und Tether fuer Bootstrap
        // https://getbootstrap.com/docs/4.0/getting-started/webpack
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            Popper: ['popper.js', 'default'],
            'window.jQuery': 'jquery',
        }),

        // http://github.com/webpack-contrib/extract-text-webpack-plugin
        // aus .css und .scss-Dateien wird app.css erstellt: siehe index.ts
        new ExtractTextPlugin({
            filename: 'app.css',
            allChunks: true,
        }),

        // http://github.com/jantimon/html-webpack-plugin
        // index.html erstellen einschl. Chunks fuer JS und app.css (s.o.)
        // https://github.com/SimenB/add-asset-html-webpack-plugin
        new HtmlWebpackPlugin({
            template: 'src/index.html',
        }),

        // Bilder usw. kopieren, die nicht in einem Chunk enthalten sind
        // http://github.com/kevlened/copy-webpack-plugin
        new CopyWebpackPlugin([
            {
                from: 'src/img',
                to: './img',
            },
            // ggf. https://github.com/jantimon/favicons-webpack-plugin
            {
                from: 'src/favicon.ico',
                to: './',
            },
            {
                from: 'src/js',
                to: './js',
            },
        ]),

        // https://webpack.js.org/plugins/context-replacement-plugin
        // http://stackoverflow.com/questions/25384360/...
        // ...how-to-prevent-moment-js-from-loading-locales-with-webpack/25426019#25426019
        // https://github.com/webpack/webpack/issues/3128#issuecomment-383407997
        new webpack.ContextReplacementPlugin(
            /* eslint no-useless-escape: 0 */
            /moment[\/\\]locale/,
            /de\.js/,
        ),

        new LodashModuleReplacementPlugin({
            // @ts-ignore
            version: true,
            times: true,
        }),

        // new PrettierPlugin({
        //     extensions: ['.ts'],
        // }),

        // https://github.com/th0r/webpack-bundle-analyzer
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            // openAnalyzer: true,
        }),
    ],

    // https://webpack.js.org/configuration/watch
    watch: true,
    // watchOptions: {
    //     // Millisekunden
    //     aggregateTimeout: 300
    // }

    cache: true,

    // https://webpack.js.org/configuration/dev-server
    // https://github.com/webpack/docs/wiki/webpack-dev-server
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        historyApiFallback: true,
        hot: true,
        watchContentBase: true,
        https: {
            key: fs.readFileSync(`${__dirname}/config/webserver/https/key.pem`),
            cert: fs.readFileSync(
                `${__dirname}/config/webserver/https/certificate.cer`,
            ),
            ca: fs.readFileSync(`${__dirname}/config/webserver/https/key.pem`),
        },
        port: 443,
        overlay: {
            warnings: true,
            errors: true,
        },
        open: 'Chrome',
        compress: true,
    },
}
