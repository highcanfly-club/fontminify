/**
 * @file svg2ttf
 * @author junmer eltorio
 */

/* eslint-env node */

import isSvg from 'is-svg';

import through from 'through2';
import {ab2b} from 'b3b';
import replaceExt from 'replace-ext';
import _ from 'lodash';
import fe from 'fonteditor-core';
const TTFReader = fe.TTFReader
const TTFWriter = fe.TTFWriter
const svg2ttfobject = fe.svg2ttfobject
/**
 * svg2ttf fontmin plugin
 *
 * @param {Object} opts opts
 * @return {Object} stream.Transform instance
 * @api public
 */
export default opts => {

    opts = _.extend({clone: true, hinting: true}, opts);

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

        // check svg
        if (!isSvg(file.contents)) {
            cb(null, file);
            return;
        }

        // clone
        if (opts.clone) {
            this.push(file.clone(false));
        }

        // replace ext
        file.path = replaceExt(file.path, '.ttf');


        // ttf buffer
        let output;

        try {

            const ttfObj = svg2ttfobject(
                file.contents.toString('utf-8')
            );

            output = ab2b(new TTFWriter(opts).write(ttfObj));

        }
        catch (ex) {
            cb(ex);
        }

        if (output) {
            file.contents = output;
            cb(null, file);
        }

    });

};



