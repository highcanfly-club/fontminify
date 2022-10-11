
# @sctg/fontminify (just a minimal change to [original](https://github.com/ecomfe/fontmin))
**Minify font seamlessly**

![npm](https://img.shields.io/npm/v/@sctg/fontminify)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/highcanfly-club/fontminify/Publish%20to%20NPMJS)
![npm](https://img.shields.io/npm/dw/@sctg/fontminify)
![GitHub](https://img.shields.io/github/license/highcanfly-club/fontminify)


## Original homepage

- [English](http://ecomfe.github.io/fontmini/en)
- [简体中文](http://ecomfe.github.io/fontmin/)
- [繁體中文](http://ecomfe.github.io/fontmini/tw)
- [日本語](http://ecomfe.github.io/fontmini/jp)
- [한국어](http://ecomfe.github.io/fontmini/kr)

## Install

```sh
$ npm install --save @sctg/fontminify
```

## Usage

This is now a strict ES6 module
```js
import Fontminify from '@sctg/fontminify';

const fontminify = new Fontminify()
    .src('fonts/*.ttf')
    .dest('build/fonts');

fontminify.run(function (err, files) {
    if (err) {
        throw err;
    }

    console.log(files[0]);
    // => { contents: <Buffer 00 01 00 ...> }
});
```

You can use [gulp-rename](https://github.com/hparra/gulp-rename) to rename your files:

```js
import Fontminify from '@sctg/fontminify';
import rename from 'gulp-rename';

const fontminify = new Fontimify()
    .src('fonts/big.ttf')
    .use(rename('small.ttf'));
```

Sample asynchronous Typescript  
```ts
import Fontminify from '@sctg/fontminify'
import stream from 'stream'
import gulp from 'gulp'
function convertTTF2WEB(srcPath: string, dstPath: string): Promise<FontminifyFile[]> {
    return new Promise<FontminifyFile[]>((resolve, reject) => {
        const fontmin = new Fontminify()
            .src(srcPath + '/*.ttf')
            .dest(dstPath + '/')
            .use(Fontminify.ttf2woff())
            .use(Fontminify.ttf2woff2())
            .use(Fontminify.css({
                fontPath: srcPath + '/',
            }));

        fontmin.run((err: Error, files: FontminifyFile[], stream) => {
            if (err) {
                reject(err);
            } else {
                resolve(files)
            }
        })
    })
}
```

## API

### new Fontimify()

Creates a new `Fontimify` instance.

### .src(file)

Type: `Array|Buffer|String`

Set the files to be optimized. Takes a buffer, glob string or an array of glob strings
as argument.

### .dest(folder)

Type: `String`

Set the destination folder to where your files will be written. If you don't set
any destination no files will be written.

### .use(plugin)

Type: `Function`

Add a `plugin` to the middleware stack.

### .run(cb)

Type: `Function`

Optimize your files with the given settings.

#### cb(err, files, stream)

The callback will return an array of vinyl files in `files` and a Readable/Writable
stream in `stream`

## Plugins

The following plugins are bundled with fontminify:

* [glyph](#glyph) — Compress ttf by glyph.
* [ttf2eot](#ttf2eot) — Convert ttf to eot.
* [ttf2woff](#ttf2woff) — Convert ttf to woff.
* [ttf2woff2](#ttf2woff2) — Convert ttf to woff2.
* [ttf2svg](#ttf2svg) — Convert ttf to svg.
* [css](#css) — Generate css from ttf, often used to make iconfont.
* [svg2ttf](#svg2ttf) — Convert font format svg to ttf.
* [svgs2ttf](#svgs2ttf) — Concat svg files to a ttf, just like css sprite.
* [otf2ttf](#otf2ttf) — Convert otf to ttf.

### .glyph()

Compress ttf by glyph.

```js
import Fontminify from '@sctg/fontminify'

const fontminify = new Fontimify()
    .use(Fontimify.glyph({ 
        text: '天地玄黄 宇宙洪荒',
        hinting: false         // keep ttf hint info (fpgm, prep, cvt). default = true
    }));
```

### .ttf2eot()

Convert ttf to eot.

```js
import Fontminify from '@sctg/fontminify'

const fontminify = new Fontimify()
    .use(Fontimify.ttf2eot());
```

### .ttf2woff()

Convert ttf to woff.

```js
import Fontminify from '@sctg/fontminify'

const fontminify = new Fontimify()
    .use(Fontimify.ttf2woff({
        deflate: true           // deflate woff. default = false
    }));
```

### .ttf2woff2()

Convert ttf to woff2.

```js
import Fontminify from '@sctg/fontminify'

const fontminify = new Fontimify()
    .use(Fontimify.ttf2woff2());
```

### .ttf2svg()

Convert ttf to svg.

you can use [imagemin-svgo](https://github.com/imagemin/imagemin-svgo) to compress svg:

```js
import svgo from 'imagemin-svgo'
import Fontminify from '@sctg/fontminify'

const fontminify = new Fontimify()
    .use(Fontimify.ttf2svg())
    .use(svgo());

```

### .css()

Generate css from ttf, often used to make iconfont.

```js
import Fontminify from '@sctg/fontminify'

const fontminify = new Fontimify()
    .use(Fontimify.css({
        fontPath: './',                             // location of font file 
        base64: true,                               // inject base64 data:application/x-font-ttf; (gzip font with css). 
                                                    // default = false
        glyph: true,                                // generate class for each glyph. default = false
        iconPrefix: 'my-icon',                      // class prefix, only work when glyph is `true`. default to "icon"
        fontFamily: 'myfont',                       // custom fontFamily, default to filename or get from analysed ttf file
        asFileName: false,                          // rewrite fontFamily as filename force. default = false
        local: true,                                // boolean to add local font. default = false
        tpl: '[fontminify-dir]/lib/font-face.tpl'   // an alternative css template (default internal one)
    }));
```

Alternatively, a transform function can be passed as `fontFamily` option.
```js
import Fontminify from '@sctg/fontminify'

const fontminify = new Fontimify()
    .use(Fontimify.css({
        // ...
        fontFamily: function(fontInfo, ttf) {
          return "Transformed Font Family Name"
        },
        // ...
    }));
```

### .svg2ttf()

Convert font format svg to ttf.

```js
import Fontminify from '@sctg/fontminify'

const fontminify = new Fontimify()
    .src('font.svg')
    .use(Fontimify.svg2ttf());
```

### .svgs2ttf()

Concat svg files to a ttf, just like css sprite.

awesome work with [css](#css) plugin:

```js
import Fontminify from '@sctg/fontminify'

const fontminify = new Fontimify()
    .src('svgs/*.svg')
    .use(Fontimify.svgs2ttf('font.ttf', {fontName: 'iconfont'}))
    .use(Fontimify.css({
        glyph: true
    }));
```

### .otf2ttf()

Convert otf to ttf.

```js
import Fontminify from '@sctg/fontminify'

const fontminify = new Fontimify()
    .src('fonts/*.otf')
    .use(Fontimify.otf2ttf());
```

## CLI

```bash
$ npm install -g fontminify
```

```sh
$ fontminify --help

  Usage
    $ fontminify <file> [<output>]
    $ fontminify <directory> [<output>]
    $ fontminify <file> > <output>
    $ cat <file> | fontminify > <output>

  Example
    $ fontminify fonts/* build
    $ fontminify fonts build
    $ fontminify foo.ttf > foo-optimized.ttf
    $ cat foo.ttf | fontminify > foo-optimized.ttf

  Options
    -t, --text                          require glyphs by text
    -b, --basic-text                    require glyphs with base chars
    -d, --deflate-woff                  deflate woff
    --font-family                       font-family for @font-face CSS
    --css-glyph                         generate class for each glyf. default = false
    -T, --show-time                     show time fontminify cost
```

you can use `curl` to generate font for websites running on PHP, ASP, Rails and more:

```sh
$ text=`curl www.baidu.com` && fontminify -t "$text" font.ttf
```
or you can use [html-to-text](https://www.npmjs.com/package/html-to-text) to make it smaller:

```sh
$ npm install -g html-to-text
$ text=`curl www.baidu.com | html-to-text` && fontminify -t "$text" font.ttf
```

what is more, you can use [phantom-fetch-cli](https://www.npmjs.com/package/phantom-fetch-cli) to generate font for `SPA` running JS template:

```sh
$ npm install -g phantom-fetch-cli
$ text=`phantom-fetch http://www.chinaw3c.org` && fontminify -t "$text" font.ttf
```

## Related

- [fontminify-app](https://github.com/ecomfe/fontminify-app)
- [gulp-fontminify](https://github.com/ecomfe/gulp-fontminify)
- [fonteditor](https://github.com/ecomfe/fonteditor)

## Thanks

- [imagemin](https://github.com/imagemin/imagemin)
- [free chinese font](http://zenozeng.github.io/Free-Chinese-Fonts/)
- [浙江民间书刻体][font-url]

## License

MIT © [Ronan Le Meillat / ecomfe](https://raw.githubusercontent.com/highcanfly-club/fontminify/master/LICENSE)

