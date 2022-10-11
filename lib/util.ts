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
 */
function getFontFolder():string {
    return path.resolve({
        win32: '/Windows/fonts',
        darwin: '/Library/Fonts',
        linux: '/usr/share/fonts/truetype'
    }[process.platform]);
}

/**
 * getFonts
 *
 */
function getFonts():string[] {
    return fs.readdirSync(getFontFolder());
}

/**
 * getPureText
 *
 * @see https://msdn.microsoft.com/zh-cn/library/ie/2yfce773
 * @see http://www.unicode.org/charts/
 *
 * @param  str target text
 * @return     pure text
 */
function getPureText(str:string) {

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
 */
 function getUniqText(str:string) {
    return [...new Set(str.split(''))].join('')
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
 */
 function string2unicodes(str:string) {
    return [...new Set(codePoints(str)as number[])];
  }

export {getFontFolder};
export {getFonts};
export {getPureText};
export {getUniqText};
export {getSubsetText};
export {string2unicodes};
