/**
 * @file css
 * @author junmer
 */

/* eslint-env node */
import _ from "lodash";

import * as fs from "fs";
import * as path from "path";
import isTtf from "is-ttf";
import through from "through2";
import replaceExt from "replace-ext";
import {b2a} from "b3b";
import {fileURLToPath} from 'url';
import type { CssOption, FontInfo } from "../index.js";
import { TTF } from "fonteditor-core/index.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Glyph = {
  code: string,
  codeName: string,
  name: string,
}
/**
 * listUnicode
 *
 * @param  {Array} unicode unicode
 * @return {string}         unicode string
 */
function listUnicode(unicode) {
  return unicode
    .map(u => {
      return "\\" + u.toString(16);
    })
    .join(",");
}

/**
 * get glyf list from ttf obj
 *
 * @param {ttfObject} ttf ttfObject
 * @return {Object} icon obj
 */
function getGlyfList(ttf:TTF.TTFObject) {
  const glyfList = [] as Glyph[];

  // exclude empty glyf
  const filtered = ttf.glyf.filter(g => {
    return (
      g.name !== ".notdef" &&
      g.name !== ".null" &&
      g.name !== "nonmarkingreturn" &&
      g.unicode &&
      g.unicode.length
    );
  });

  // format glyf info
  filtered.forEach(g => {
    glyfList.push({
      code: "&#x" + g.unicode[0].toString(16) + ";",
      codeName: listUnicode(g.unicode),
      name: g.name || "uni" + g.unicode[0].toString(16),
    });
  });

  return {
    glyfList: glyfList,
  };
}

/**
 * get font family name
 *
 * @param {Object} fontInfo font info object
 * @param {ttfObject} ttf ttfObject
 * @param {Object} opts opts
 * @return {string} font family name
 */
function getFontFamily(fontInfo, ttf, opts) {
  let fontFamily = opts.fontFamily;
  // Call transform function
  if (typeof fontFamily === "function") {
    fontFamily = fontFamily(_.cloneDeep(fontInfo), ttf);
  }
  return fontFamily || ttf.name.fontFamily || fontInfo.fontFile;
}

/**
 * Transform font family name
 * @callback FontFamilyTransform
 * @param {Object} font info object
 * @param {ttfObject} ttf ttfObject
 * @return {string} font family name
 */
// function(fontInfo, ttfObject) { return "Font Name"; }

/**
 * css fontmin plugin
 *
 * @param {(string|FontFamilyTransform)=} opts.fontFamily fontFamily
 * @return {Object} stream.Transform instance
 * @api public
 */
export default (_opts?: CssOption) => {
  const opts = _opts || {};

  return through.ctor(
    {
      objectMode: true,
    },
    function (file, enc, cb) {
      // check null
      if (file.isNull()) {
        cb(null, file);
        return;
      }

      // check stream
      if (file.isStream()) {
        cb(new Error("Streaming is not supported"));
        return;
      }

      // check ttf
      if (!isTtf(file.contents)) {
        cb(null, file);
        return;
      }

      // clone
      this.push(file.clone(false));

      file.path = replaceExt(file.path, ".css");
      const fontFile = opts.filename || path.basename(file.path, ".css");

      // font data
      const fontInfo = {
        fontFile: fontFile,
        fontPath: "",
        base64: false,
        glyph: false,
        iconPrefix: "icon",
        local: false,
      } as FontInfo;

      // opts
      _.extend(fontInfo, opts);

      // ttf obj
      const ttfObject = file.ttfObject || {
        name: {},
      };

      // glyph
      if (opts.glyph && ttfObject.glyf) {
        _.extend(fontInfo, getGlyfList(ttfObject));
      }

      // font family
      fontInfo.fontFamily = getFontFamily(fontInfo, ttfObject, opts);

      // rewrite font family as filename
      if (opts.asFileName) {
        fontInfo.fontFamily = fontFile;
      }

      // base64
      if (opts.base64) {
        fontInfo.base64 =
          "" +
          "data:application/x-font-ttf;charset=utf-8;base64," +
          b2a(file.contents);
      }

      // local
      // if (fontInfo.local === true) {
      //   fontInfo.local = fontInfo.fontFamily as string;
      // }

      // render
      const output = _.attempt(data => {
        let tpl = "";
        if (opts.tpl && opts.tpl.length && fs.existsSync(opts.tpl)) {
          tpl = fs.readFileSync(opts.tpl).toString("utf-8");
        } else {
          tpl = fs
            .readFileSync(path.resolve(__dirname, "../lib/font-face.tpl"))
            .toString("utf-8");
        }
        const renderCss = _.template(tpl);
        return Buffer.from(renderCss(data));
      }, fontInfo);

      if (_.isError(output)) {
        cb(output, file);
      } else {
        file.contents = output;
        cb(null, file);
      }
    }
  );
};
