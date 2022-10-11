/**
 * @file svgs2ttf
 * @author junmer
 */

/* eslint-env node */

import isSvg from 'is-svg';

import through from 'through2';
import * as path from 'path';
import replaceExt from 'replace-ext';
import {ab2b} from 'b3b';
import _ from 'lodash';
import bufferToVinyl from 'buffer-to-vinyl';
import fe, { TTF } from 'fonteditor-core';
import getEmpty from 'fonteditor-core/lib/ttf/getEmptyttfObject.js'
import type {PluginFromSVGOption} from '../index.js'
import * as File from 'vinyl'

const TTF = fe.TTF
const TTFWriter = fe.TTFWriter
const svg2ttfobject = fe.svg2ttfobject
const getEmptyttfObject = () => getEmpty.default()
/**
 * SvgFont
 *
 * @constructor
 * @param {string} name filename
 * @param {Object} opts opts
 */
class SvgFont {
    opts: PluginFromSVGOption;
    ttf: typeof TTF;
    startCode: number;
    contents: Buffer;
    constructor(name, opts) {

        this.opts = _.extend(
            {
                adjust: {
                    leftSideBearing: 0,
                    rightSideBearing: 0,
                    ajdustToEmBox: true,
                    ajdustToEmPadding: 0
                },
                name: {
                    fontFamily: name,
                    fontSubFamily: name,
                    uniqueSubFamily: name,
                    postScriptName: name
                }
            },
            opts
        );

        // empty ttfobj
        const ttfobj = getEmptyttfObject();
        // for save name
        ttfobj.post.format = 2;

        // new TTF
        this.ttf = new TTF(ttfobj);

        // set name
        this.ttf.setName(this.opts.name);

        // unicode start
        this.startCode = opts.startCode || 0xe001;

    }

    /**
     * add svg
     */
    add(name:string, contents:Buffer) {

        const ttfObj = svg2ttfobject(
            contents.toString('utf-8'),
            {
                combinePath: true
            }
        );

        const glyf = ttfObj.glyf[0];

        glyf.name = path.basename(name, '.svg');

        if (!Array.isArray(glyf.unicode)) {
            glyf.unicode = [this.startCode++];
        }

        this.ttf.addGlyf(glyf);

    }

    /**
     * compile ttf contents
     *
     */
    compile() {

        if (this.opts.adjust) {
            this.ttf.adjustGlyfPos(null, this.opts.adjust);
            this.ttf.adjustGlyf(null, this.opts.adjust);
        }

        this.contents = ab2b(
            new TTFWriter(
                this.opts
            )
            .write(
                this.ttf.ttf
            )
        );

    }
}

/**
 * svgs2ttf fontmin plugin
 *
 * @api public
 */
export default (file:string|File, opts:PluginFromSVGOption) => {

    if (!file) {
        throw new Error('Missing file option for fontmin-svg2ttf');
    }

    opts = _.extend({hinting: true}, opts);

    let firstFile;
    let fileName:string;
    let svgFont;

    if (typeof file === 'string') {

        // fix file ext
        file = replaceExt(file, '.ttf');

        // set file name
        fileName = file as string;
    }
    else if (typeof file.path === 'string') {
        fileName = path.basename(file.path);
        firstFile = bufferToVinyl.file(null, fileName);
    }
    else {
        throw new Error('Missing path in file options for fontmin-svg2ttf');
    }


    function bufferContents(file:File, enc, cb) {

        // ignore empty files
        if (file.isNull()) {
            cb();
            return;
        }

        // check stream
        if (file.isStream()) {
            this.emit('error', new Error('Streaming not supported'));
            cb();
            return;
        }

        // check svg
        if (!isSvg(file.contents as Buffer)) {
            cb();
            return;
        }

        // set first file if not already set
        if (!firstFile) {
            firstFile = file;
        }

        // construct SvgFont instance
        if (!svgFont) {
            const fontName = opts.fontName || path.basename(fileName, '.ttf');
            svgFont = new SvgFont(fontName, opts);
        }

        // add file to SvgFont instance
        svgFont.add(file.relative, file.contents);

        cb();
    }


    function endStream(cb) {
        // no files passed in, no file goes out
        if (!firstFile || !svgFont) {
            cb();
            return;
        }

        let joinedFile;

        // if file opt was a file path
        // clone everything from the first file
        if (typeof file === 'string') {
            joinedFile = firstFile.clone({
                contents: false
            });

            joinedFile.path = path.join(firstFile.base, file);
        }
        else {
            joinedFile = firstFile;
        }

        // complie svgfont
        svgFont.compile();

        // set contents
        joinedFile.contents = svgFont.contents;
        joinedFile.ttfObject = svgFont.ttf.ttf;

        this.push(joinedFile);
        cb();
    }

    return through.obj(bufferContents, endStream);

};
