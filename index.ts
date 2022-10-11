/**
 * @file fontmin
 * @author junmer
 */

/* eslint-env node */

import combine from "stream-combiner";
import stream  from "stream";
import concat from "concat-stream";
import { EventEmitter } from "events";
import bufferToVinyl from "buffer-to-vinyl";
import vfs from "vinyl-fs";
import _css from "./plugins/css.js";
import _glyph from "./plugins/glyph.js";
import _otf2ttf from "./plugins/otf2ttf.js";
import _svg2ttf from "./plugins/svg2ttf.js";
import _svgs2ttf from "./plugins/svgs2ttf.js";
import _ttf2eot from "./plugins/ttf2eot.js";
import _ttf2svg from "./plugins/ttf2svg.js";
import _ttf2woff from "./plugins/ttf2woff.js";
import _ttf2woff2 from "./plugins/ttf2woff2.js";
import {
  getFontFolder as _getFontFolder,
  getFonts as _getFonts,
  getPureText as _getPureText,
  getUniqText as _getUniqText,
  getSubsetText as _getSubsetText,
  string2unicodes as _string2unicodes,
} from "./lib/util.js";

type FontminifyPlugin = Function | stream.Transform;
type ProbableAsSrc = string[] | string | Buffer;

interface PluginCloneOption {
  clone?: boolean;
}

interface PluginHintOption {
  hinting?: boolean;
}

interface PluginFromSVGOption extends PluginHintOption {
  fontName?: string;
  adjust?: {
    leftSidebearing: number;
    rightSidebearing: number;
    ajdustToEmBox: boolean;
    ajdustToEmPadding: number;
  };
  name?: {
    fontFamily?: string;
    fontSubFamily?: string;
    uniqueSubFamily?: string;
    postScriptName?: string;
  };
}

interface FontInfo {
  fontFile: string;
  fontPath: string;
  base64: boolean;
  glyph: boolean;
  iconPrefix: string;
  local: boolean;
}

interface CssOption {
  glyph?: boolean;
  base64?: boolean;
  iconPrefix?: string;
  fontFamily?: string | ((fontinfo: FontInfo, ttf: any) => string);
  filename?: string;
  fontPath?: string;
  asFileName?: boolean;
  local?: boolean;
  tpl?: string;
}

interface GlyphOption {
  text?: string;
  basicText?: boolean;
  hinting?: boolean;
  use?: FontminifyPlugin;
}

/**
 * Initialize Fontmin
 *
 * @constructor
 * @api public
 */
class Fontminify <SrcType extends ProbableAsSrc> extends EventEmitter {
  constructor() {
    super();
    if (!(this instanceof Fontminify)) {
      return new Fontminify();
    }
    this.streams = [];
  }

  /**
   * Get or set the source files
   *
   * @param {Array|Buffer|string} file files to be optimized
   * @return {Object} fontmin
   * @api public
   */
  src(file) {
    if (!arguments.length) {
      return this._src;
    }

    this._src = arguments;
    return this;
  }

  /**
   * Get or set the destination folder
   *
   * @param {string} dir folder to written
   * @return {Object} fontmin
   * @api public
   */
  dest(dir) {
    if (!arguments.length) {
      return this._dest;
    }

    this._dest = arguments;
    return this;
  }

  /**
   * Add a plugin to the middleware stack
   *
   * @param {Function} plugin plugin
   * @return {Object} fontmin
   * @api public
   */
  use(plugin) {
    this.streams.push(typeof plugin === "function" ? plugin() : plugin);
    return this;
  }
  /**
   * Optimize files
   *
   * @param {Function} cb callback
   * @return {Stream} file stream
   * @api public
   */
  run(cb) {
    cb = cb || (() => {});

    const stream = this.createStream();

    stream.on("error", cb);
    stream.pipe(concat(cb.bind(null, null)));

    return stream;
  }

  /**
   * Create stream
   *
   * @return {Stream} file stream
   * @api private
   */
  createStream() {
    this.streams.unshift(this.getFiles());

    if (this.streams.length === 1) {
      this.use(Fontminify.otf2ttf());
      this.use(Fontminify.ttf2eot());
      this.use(Fontminify.ttf2woff());
      this.use(Fontminify.ttf2woff2());
      this.use(Fontminify.ttf2svg());
      this.use(Fontminify.css());
    }

    if (this.dest()) {
      this.streams.push(vfs.dest(...this.dest()));
    }

    return combine(this.streams);
  }

  /**
   * Get files
   *
   * @return {Stream} file stream
   * @api private
   */
  getFiles() {
    if (Buffer.isBuffer(this._src[0])) {
      return bufferToVinyl.stream(this._src[0]);
    }

    return vfs.src(...this.src());
  }
  static glyph = (opts: GlyphOption): stream.Transform => _glyph(opts);
  static ttf2eot = (opts?: PluginCloneOption): stream.Transform => _ttf2eot(opts);
  static ttf2woff = (opts?: PluginCloneOption): stream.Transform => _ttf2woff(opts);
  static ttf2woff2 = (opts?: PluginCloneOption): stream.Transform => _ttf2woff2(opts);
  static ttf2svg = (opts?: PluginCloneOption): stream.Transform => _ttf2svg(opts);
  static css = (opts: CssOption): stream.Transform => _css(opts);
  static svg2ttf = (opts?: PluginCloneOption & PluginHintOption): stream.Transform => _svg2ttf(opts);
  static svgs2ttf = (file: string, opts?: PluginFromSVGOption): stream.Transform => _svgs2ttf(file,opts);
  static otf2ttf = (opts?: PluginCloneOption & PluginHintOption): stream.Transform => _otf2ttf(opts);

  static util = {
    getFontFolder: () => _getFontFolder(),
    getFonts: () => _getFonts(),
    getPureText: (str:string) => _getPureText(str),
    getUniqText: (str:string) => _getUniqText(str),
    getSubsetText: (opts) => _getSubsetText(opts),
    string2unicodes: (str:string) => _string2unicodes(str),
  };
  static plugins = [
    "glyph",
    "ttf2eot",
    "ttf2woff",
    "ttf2woff2",
    "ttf2svg",
    "css",
    "svg2ttf",
    "svgs2ttf",
    "otf2ttf",
  ];

}

/**
 * Module exports
 */
export default Fontminify;

export const mimeTypes = {
  ".*": "application/octet-stream",
  ttf: "application/font-sfnt",
  otf: "application/font-sfnt",
  woff: "application/font-woff",
  woff2: "application/font-woff2",
  eot: "application/octet-stream",
  svg: "image/svg+xml",
  svgz: "image/svg+xml",
};