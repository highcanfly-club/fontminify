/**
 * @file  fontmin subset
 * @author junmer eltorio
 */

/* eslint-env node */
/* global before */

import {expect} from 'chai';

import fs, { cp } from 'fs';
import path from 'path';
import clean from 'gulp-clean';
import isTtf from 'is-ttf';
import Fontminify from '../dist/index.js';
import fe from 'fonteditor-core';
import {b2ab} from 'b3b';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TTFReader = fe.TTFReader
const fontName = 'SentyBrush';
const fontDir = path.resolve(__dirname, '../fonts');
const srcPath = path.resolve(fontDir, fontName + '.ttf');
const destPath = path.resolve(fontDir, 'dest_ttf');

// first mined ttf
let mined;

// first min
before(done => {

    // clean
    new Fontminify()
        .src(destPath)
        .use(clean())
        .run(afterClean);

    // subset first
    const fontmin = new Fontminify()
        .src(srcPath)
        .use(Fontminify.glyph({
            text: 'abcd   efg',
            // trim: false
        }))
        .dest(destPath);

    function afterClean() {
        fontmin.run((err, files, stream) => {
            mined = files[0].contents;
            done();
        });
    }


});

describe('subset', () => {

    it('input is\'t ttf shoud be pass', done => {

        new Fontminify()
            .src(fontDir + '/*.html')
            .use(Fontminify.glyph({
                text: 'test'
            }))
            .run((err, files) => {
                const ext = path.extname(files[0].path);
                expect(ext).equal('.html');
                done();
            });

    });

    it('should be ok when unicodes out of subbset', () => {

        // it ttf
        expect(isTtf(mined)).to.be.ok;

    });

    it('dest should be minier ttf', () => {

        const srcFile = fs.readFileSync(srcPath);

        // minier
        expect(mined.length).to.be.below(srcFile.length);

    });

    // it('should has whitespace when trim false', function () {

    //     var TTFReader = require('fonteditor-core').TTFReader;
    //     var b2ab = require('b3b').b2ab;
    //     var ttf = new TTFReader().read(b2ab(mined));

    //     // contain whitespace
    //     expect(ttf.cmap).to.contain.any.keys(['32', '160', '202']);

    // });

    it('should has whitespace when mixed text and whitespace', () => {

        const ttf = new TTFReader().read(b2ab(mined));

        // contain whitespace
        expect(ttf.cmap).to.contain.any.keys(['32']);

    });

    it('should support empty text', done => {

        new Fontminify()
            .src(srcPath)
            .use(Fontminify.glyph({
                text: ''
            }))
            .run(done);

    });

     it('should support UTF-16-encoded text', done => {

        new Fontminify()
            .src(srcPath)
            .use(Fontminify.glyph({
                text: '🐴'
            }))
            .run(done);

    });

    it('should support use plugin function', done => {

        new Fontminify()
            .src(srcPath)
            .use(Fontminify.glyph({
                text: 'test',
                use: function (ttf) {
                    expect(ttf).to.have.any.keys('ttf');
                }
            }))
            .run(done);

    });

    it('should pass use plugin not function', done => {

        new Fontminify()
            .src(srcPath)
            .use(Fontminify.glyph({
                use: false
            }))
            .run(done);

    });

    it('subset of non-existent character shoud be ttf', done => {

        const destTtf = path.resolve(destPath, fontName + '.ttf');

        const fontmin = new Fontminify()
            .src(destTtf)
            .use(Fontminify.glyph({
                text: '字体里是没有中文字符的',
                basicText: true
            }));

        fontmin.run((err, files, stream) => {

            const twiceMined = files[0].contents;

            // it ttf
            expect(isTtf(twiceMined)).to.be.ok;

            done();
        });


    });


});
