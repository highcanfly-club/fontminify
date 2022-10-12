/**
 * @file  fontmin base
 * @author junmer eltorio
 */

/* eslint-env node */

import {expect} from 'chai';

import path from 'path';
import bufferToVinyl from 'buffer-to-vinyl';
import Fontmin from '../index.js';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fm = Fontmin;
const fontPath = path.resolve(__dirname, '../fonts');

describe('Fontmin util', () => {

    it('getFontFolder should be string', () => {
        expect(Fontmin.util.getFontFolder()).to.be.a('string');
    });

    it('getFonts should be array', () => {
        expect(Fontmin.util.getFonts()).to.be.a('array');
    });

});


describe('Fontmin base', () => {

    it('should run when no cb', done => {

        new fm()
            .src(fontPath + '/**.empty')
            .run()
            .on('end', () => {
                done();
            });
    });


    it('should not dest when src buffer', done => {

        new fm()
            .src(Buffer.from(''))
            .dest(fontPath + '/dest')
            .run((err, files, stream) => {
                done();
            });
    });


    it('should run when src null', done => {

        const plugins = Fontmin.plugins.filter(plugin => {
            return plugin !== 'svgs2ttf';
        });

        let works = plugins.length;

        function usePlugin(plugin) {

            new fm()
                .src(fontPath + '/SentyBrush.ttf', {read: false})
                .use(Fontmin[plugin]())
                .run((err, files, stream) => {

                    expect(files.length).equal(1);

                    if (0 === --works) {
                        done();
                    }

                });
        }

        plugins.forEach(usePlugin);

    });


    it('should dest one when clone false', done => {


        const plugins = ['ttf2eot', 'ttf2woff', 'ttf2svg'];
        let works = plugins.length;

        function usePlugin(plugin) {

            new fm()
                .src(fontPath + '/SentyBrush.ttf')
                .use(Fontmin.glyph({text: '1'}))
                .use(Fontmin[plugin]({clone: false}))
                .run((err, files, stream) => {

                    expect(files.length).equal(1);

                    if (0 === --works) {
                        done();
                    }

                });
        }

        plugins.forEach(usePlugin);


    });

    it('should exclude files not font', done => {

        new fm()
            .src(fontPath + '/**.html', {read: false})
            .dest(fontPath + '/dest')
            .run((err, files, stream) => {
                expect(files.length).equal(1);
                done();
            });
    });

    it('should throw `Streaming is not supported`', done => {

        const plugins = Fontmin.plugins;
        let works = plugins.length;

        function usePlugin(plugin) {

            new fm()
                .src(fontPath + '/SentyBrush.ttf', {buffer: false})
                .use(Fontmin[plugin]('test'))
                .run((err, files, stream) => {

                    expect(err).to.match(/Streaming/);

                    if (0 === --works) {
                        done();
                    }

                });
        }

        plugins.forEach(usePlugin);

    });


});
