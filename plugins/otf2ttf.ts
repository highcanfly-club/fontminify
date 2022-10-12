/**
 * @file otf2ttf
 * @author junmer eltorio
 */

/* eslint-env node */

import isOtf from 'is-otf';

import through from 'through2';
import fe from 'fonteditor-core';
import {b2ab} from 'b3b';
import {ab2b} from 'b3b';
import replaceExt from 'replace-ext';
import _ from 'lodash';
const TTFWriter = fe.TTFWriter
const otf2ttfobject = fe.otf2ttfobject
import {
    getFontFolder,
    getFonts,
    getPureText,
    getUniqText,
    getSubsetText,
    string2unicodes,
  } from '../lib/util.js'
/**
 * otf2ttf fontmin plugin
 *
 * @param {Object} opts opts
 * @return {Object} stream.Transform instance
 * @api public
 */
export default opts => {

    opts = _.extend({clone: false, hinting: true}, opts);

    // prepare subset
    const subsetText = getSubsetText(opts);
    opts.subset = string2unicodes(subsetText);

    return through.ctor({
        objectMode: true
    }, function (file, enc, cb) {

        // check null
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        // check stream
        if (file.isStream()) {
            cb(new Error('Streaming is not supported'));
            return;
        }

        // check otf
        if (!isOtf(file.contents)) {
            cb(null, file);
            return;
        }

        // clone
        if (opts.clone) {
            this.push(file.clone(false));
        }

        // replace ext
        file.path = replaceExt(file.path, '.ttf');

        // ttf info
        let ttfBuffer;
        let ttfObj;

        // try otf2ttf
        try {

            ttfObj = otf2ttfobject(b2ab(file.contents), opts);

            ttfBuffer = ab2b(new TTFWriter(opts).write(ttfObj));

        }
        catch (ex) {
            cb(ex);
        }

        if (ttfBuffer) {
            file.contents = ttfBuffer;
            file.ttfObject = ttfObj;
            cb(null, file);
        }

    });

};

