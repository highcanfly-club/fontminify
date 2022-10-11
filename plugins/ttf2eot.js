/**
 * @file ttf2eot
 * @author junmer
 */

/* eslint-env node */

import isTtf from 'is-ttf';

import through from 'through2';
import fe from 'fonteditor-core';
import {b2ab} from 'b3b';
import {ab2b} from 'b3b';
import replaceExt from 'replace-ext';
import _ from 'lodash';
const ttf2eot = fe.ttf2eot

function compileTtf(buffer, cb) {
    let output;
    try {
        output = ab2b(ttf2eot(b2ab(buffer)));
    }
    catch (ex) {
        cb(ex);
    }

    output && cb(null, output);
}


/**
 * ttf2eot fontmin plugin
 *
 * @param {Object} opts opts
 * @return {Object} stream.Transform instance
 * @api public
 */
export default opts => {

    opts = _.extend({clone: true}, opts);

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

        // check ttf
        if (!isTtf(file.contents)) {
            cb(null, file);
            return;
        }

        // clone
        if (opts.clone) {
            this.push(file.clone(false));
        }

        // replace ext
        file.path = replaceExt(file.path, '.eot');

        compileTtf(file.contents, (err, buffer) => {

            if (err) {
                cb(err);
                return;
            }

            file.contents = buffer;
            cb(null, file);
        });

    });

};

