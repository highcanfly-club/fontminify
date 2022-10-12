/**
 * @file  fontmin svgs2ttf
 * @author junmer eltorio
 */

/* eslint-env node */
/* global before */

import {assert} from 'chai';

import fs from 'fs';
import path from 'path';
import clean from 'gulp-clean';
import isTtf from 'is-ttf';
import Fontmin from '../dist/index.js';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcPath = path.resolve(__dirname, '../fonts/svg/*.svg');
const destPath = path.resolve(__dirname, '../fonts/dest_svgs');
const destFile = destPath + '/iconfont';


function getFile(files, ext) {
    const re = new RegExp(ext + '$');
    const vf = files.filter(file => {
        return re.test(file.path);
    });
    return vf[0];
}

let outputFiles;

before(done => {

    // clean
    new Fontmin()
        .src(destPath)
        .use(clean())
        .run(next);



    // minfy
    const fontmin = new Fontmin()
        .src(srcPath)
        .use(Fontmin.svgs2ttf('iconfont.ttf'))
        .use(Fontmin.ttf2svg())
        .use(Fontmin.css({
            glyph: true
        }))
        .dest(destPath);

    function next() {

        fontmin.run((err, files, stream) => {

            if (err) {
                console.log(err);
                process.exit(-1);
            }

            outputFiles = files;

            done();
        });
    }

});


describe('svgs2ttf plugin', () => {

    it('should require root path', () => {
        assert.throws(Fontmin.svgs2ttf.bind(), /Missing file option/);
    });

    it('should require root path in file options', () => {
        assert.throws(
            Fontmin.svgs2ttf.bind(null, {path: null}), /file options for fontmin-svg2ttf/
        );
    });

    it('set path in file options', done => {

        new Fontmin()
            .src(srcPath)
            .use(Fontmin.svgs2ttf({path: 'test.ttf'}))
            .run((err, files) => {
                assert(isTtf(files[0].contents));
                done();
            });
    });

    it('input is\'t svg shoud be exclude', done => {

        new Fontmin()
            .src(path.resolve(__dirname, '../fonts/*.html'))
            .use(Fontmin.svgs2ttf('test.ttf'))
            .run((err, files) => {
                assert.equal(files.length, 0);
                done();
            });

    });

    it('output buffer should be ttf', () => {
        assert(isTtf(getFile(outputFiles, 'ttf').contents));
    });


    it('dest file should exist ttf', () => {
        assert(
            fs.existsSync(destFile + '.ttf')
        );
    });

    it('dest file should be ttf', () => {
        try {
            assert(
                isTtf(
                    fs.readFileSync(destFile + '.ttf')
                )
            );
        }
        catch (ex) {
            assert(false);
        }
    });

});
