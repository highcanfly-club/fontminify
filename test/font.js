/**
 * @file  fontmin font
 * @author junmer eltorio
 */

/* eslint-env node */
/* global before */

import {assert} from 'chai';

import {expect} from 'chai';
import fs from 'fs';
import path from 'path';
import clean from 'gulp-clean';
import isTtf from 'is-ttf';
import isOtf from 'is-otf';
import isEot from 'is-eot';
import isWoff from 'is-woff';
import isWoff2 from 'is-woff2';
import isSvg from 'is-svg';
import Fontminify from '../dist/index.js';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fontName = 'TpldKhangXiDictTrial';
const srcPath = path.resolve(__dirname, '../fonts/' + fontName + '.otf');
const destPath = path.resolve(__dirname, '../fonts/dest');
const destFile = path.resolve(destPath, fontName);

const text = ''
    + '天地玄黄    宇宙洪荒    日月盈昃    辰宿列张'
    + '寒来暑往    秋收冬藏    闰馀成岁    律吕调阳'
    + '云腾致雨    露结为霜    金生丽水    玉出昆冈'
    + '剑号巨阙    珠称夜光    果珍李柰    菜重芥姜';

function getFile(files, ext) {
    const re = new RegExp(ext + '$');
    const vf = files.filter(file => {
        return re.test(file.path);
    });
    return vf[0];
}

let outputFiles;

before(function (done) {

    this.timeout(5000);

    // clean
    new Fontminify()
        .src(destPath)
        .use(clean())
        .run(next);

    // minify
    const fontmin = new Fontminify()
        .src(srcPath)
        .use(Fontminify.otf2ttf({
            text: text
        }))
        .use(Fontminify.glyph({
            text: text
        }))
        .use(Fontminify.ttf2eot())
        .use(Fontminify.ttf2woff({deflate: true}))
        .use(Fontminify.ttf2woff2())
        .use(Fontminify.ttf2svg())
        .use(Fontminify.css({
            glyph: true,
            base64: true,
            fontPath: './',
            local: true,
            fontFamily: function (font, ttf) {
                return ttf.name.fontFamily + ' - Transformed';
            }
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



describe('otf2ttf plugin', () => {

    it('input should be otf', () => {

        const srcBuffer = fs.readFileSync(srcPath);
        assert(isOtf(srcBuffer));

    });

    it('output buffer should be ttf', () => {
        assert(isTtf(getFile(outputFiles, 'ttf').contents));
    });

    it('should keep source when clone true', done => {

        new Fontminify()
            .src(srcPath)
            .use(Fontminify.otf2ttf({clone: true, text: 't'}))
            .run((err, files) => {
                assert.equal(files.length, 2);
                done();
            });

    });

});

describe('glyph plugin', () => {

    it('output buffer should be ttf', () => {
        assert(isTtf(getFile(outputFiles, 'ttf').contents));
    });

    // it('output ttf should have `cvt ` table', function () {
    //     assert(
    //         isTtf(
    //             getFile(outputFiles, 'ttf').contents, {
    //                 tables: ['cvt ']
    //             }
    //         )
    //     );
    // });

    it('output should miner than input', () => {
        const srcBuffer = fs.readFileSync(srcPath);
        assert(srcBuffer.length > getFile(outputFiles, 'ttf').contents.length);
    });

    it('dest file should exist', () => {
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

describe('ttf2eot plugin', () => {

    it('output buffer should be eot', () => {
        assert(isEot(getFile(outputFiles, 'eot').contents));
    });

    it('dest file should exist', () => {
        assert(
            fs.existsSync(destFile + '.eot')
        );
    });

    it('dest file should be eot', () => {
        try {
            assert(
                isEot(
                    fs.readFileSync(destFile + '.eot')
                )
            );
        }
        catch (ex) {
            assert(false);
        }
    });

});

describe('ttf2woff plugin', () => {

    it('output buffer should be woff', () => {
        assert(isWoff(getFile(outputFiles, 'woff').contents));
    });

    it('dest file should exist woff', () => {
        assert(
            fs.existsSync(destFile + '.woff')
        );
    });

    it('dest file should be woff', () => {
        try {
            assert(
                isWoff(
                    fs.readFileSync(destFile + '.woff')
                )
            );
        }
        catch (ex) {
            assert(false);
        }
    });

});

describe('ttf2woff2 plugin', () => {

    it('output buffer should be woff2', () => {
        assert(isWoff2(getFile(outputFiles, 'woff2').contents));
    });

    it('dest file should exist woff2', () => {
        assert(
            fs.existsSync(destFile + '.woff2')
        );
    });

    it('dest file should be woff2', () => {
        try {
            assert(
                isWoff2(
                    fs.readFileSync(destFile + '.woff2')
                )
            );
        }
        catch (ex) {
            assert(false);
        }
    });

});

describe('ttf2svg plugin', () => {

    it('output buffer should be svg', () => {
        assert(isSvg(getFile(outputFiles, 'svg').contents));
    });

    it('dest file should exist svg', () => {
        assert(
            fs.existsSync(destFile + '.svg')
        );
    });

    it('dest file should be svg', () => {
        try {
            assert(
                isSvg(
                    fs.readFileSync(destFile + '.svg')
                )
            );
        }
        catch (ex) {
            assert(false);
        }
    });

});

describe('css plugin', () => {

    it('dest file should exist css', () => {
        assert(
            fs.existsSync(destFile + '.css')
        );
    });

    it('dest css should have "@font-face"', () => {
        try {
            expect(fs.readFileSync(destFile + '.css', {
                encoding: 'utf-8'
            })).to.have.string('@font-face');
        }
        catch (ex) {
            assert(false);
        }
    });

    it('dest css shouldn\'t have ".eot"', () => {
        try {
            expect(fs.readFileSync(destFile + '.css', {
                encoding: 'utf-8'
            })).to.not.have.string('.eot');
        }
        catch (ex) {
            assert(false);
        }
    });

    it('dest css shouldn\'t have ".svg"', () => {
        try {
            expect(fs.readFileSync(destFile + '.css', {
                encoding: 'utf-8'
            })).to.not.have.string('.svg');
        }
        catch (ex) {
            assert(false);
        }
    });

    it('dest css should match /\.icon-(\w+):before/', () => {
        try {
            expect(fs.readFileSync(destFile + '.css', {
                encoding: 'utf-8'
            })).to.match(/\.icon-(\w+):before/);
        }
        catch (ex) {
            assert(false);
        }
    });

    // it('dest css should have fontPath "./"', function () {
    //     try {
    //         expect(fs.readFileSync(destFile + '.css', {
    //             encoding: 'utf-8'
    //         })).to.have.string('./');
    //         console.log(fs.readFileSync(destFile + '.css', {
    //             encoding: 'utf-8'
    //         }))
    //     }
    //     catch (ex) {
    //         assert(false);
    //     }
    // });


    it('dest css should have local()', () => {
        try {
            expect(fs.readFileSync(destFile + '.css', {
                encoding: 'utf-8'
            })).to.have.string('local');
        }
        catch (ex) {
            assert(false);
        }
    });

    it('dest css should have transformed @font-family name', () => {

        const content = fs.readFileSync(destFile + '.css', {
            encoding: 'utf-8'
        });
        const matched = content.match(/font-family: \s*"(.*?)"/);
        const fontFamily = matched[1];

        expect(fontFamily).to.be.a('string')
            .that.match(/\s-\sTransformed$/);

    });


});
