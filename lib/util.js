/**
 * @file util
 * @author junmer
 */

/* eslint-env node */

import fs from 'fs';

import path from 'path';
import _ from 'lodash';
import codePoints from 'code-points';

/**
 * getFontFolder
 *
 * @return {string} fontFolder
 */
function getFontFolder() {
    return path.resolve({
        win32: '/Windows/fonts',
        darwin: '/Library/Fonts',
        linux: '/usr/share/fonts/truetype'
    }[process.platform]);
}

/**
 * getFonts
 *
 * @param  {string} path path
 * @return {Array}      fonts
 */
function getFonts() {
    return fs.readdirSync(getFontFolder());
}

/**
 * getPureText
 *
 * @see https://msdn.microsoft.com/zh-cn/library/ie/2yfce773
 * @see http://www.unicode.org/charts/
 *
 * @param  {string} str target text
 * @return {string}     pure text
 */
function getPureText(str) {

    // fix space
    const emptyTextMap = {};

    function replaceEmpty (word) {
        emptyTextMap[word] = 1;
        return '';
    }

    const pureText = String(str)
        .trim()
        .replace(/[\s]/g, replaceEmpty)
        // .replace(/[\f]/g, '')
        // .replace(/[\b]/g, '')
        // .replace(/[\n]/g, '')
        // .replace(/[\t]/g, '')
        // .replace(/[\r]/g, '')
        .replace(/[\u2028]/g, '')
        .replace(/[\u2029]/g, '');

    const emptyText = Object.keys(emptyTextMap).join('');

    return pureText + emptyText;

}

/**
 * getUniqText
 *
 * @deprecated since version 0.9.9
 *
 * @param  {string} str target text
 * @return {string}     uniq text
 */
function getUniqText(str) {
    return _.uniq(
        str.split('')
    ).join('');
}


/**
 * basic chars
 *
 * "!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}"
 *
 * @type {string}
 */
const basicText = String.fromCharCode.apply(this, _.range(33, 126));

/**
 * get subset text
 *
 * @param  {Object} opts opts
 * @return {string}      subset text
 */
function getSubsetText(opts) {

    let text = opts.text || '';

    // trim
    text && opts.trim && (text = getPureText(text));

    // basicText
    opts.basicText && (text += basicText);

    return text;
}

/**
 * string to unicodes
 *
 * @param  {string} str string
 * @return {Array}      unicodes
 */
function string2unicodes(str) {
    return _.uniq(codePoints(str));
}

export {getFontFolder};
export {getFonts};
export {getPureText};
export {getUniqText};
export {getSubsetText};
export {string2unicodes};
