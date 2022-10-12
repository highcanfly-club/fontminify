#!/usr/bin/env node

/**
 * @file cli
 * @author junmer
 */

/* eslint-env node */

'use strict';

import * as fs from 'fs';
import meow from 'meow';
import * as path from 'path';
import stdin from 'get-stdin';
import Fontmin from './index.js';
import * as _ from 'lodash';

const cli = meow([
    'Usage',
    '  $ fontmin <file> [<output>]',
    '  $ fontmin <directory> [<output>]',
    '  $ fontmin <file> > <output>',
    '  $ cat <file> | fontmin > <output>',
    '',
    'Example',
    '  $ fontmin fonts/* build',
    '  $ fontmin fonts build',
    '  $ fontmin foo.ttf > foo-optimized.ttf',
    '  $ cat foo.ttf | fontmin > foo-optimized.ttf',
    '',
    'Options',
    '  -t, --text                          require glyphs by text',
    '  -b, --basic-text                    require glyphs with base chars',
    '  -d, --deflate-woff                  deflate woff',
    '  --font-family                       font-family for @font-face CSS',
    '  --css-glyph                         generate class for each glyf. default = false',
    '  -T, --show-time                     show time fontmin cost'
].join('\n'), {
    importMeta: import.meta,
    flags:{
        version: {
            type: 'boolean',
            alias:'v'
        },
        deflateWoff:{
            type: 'boolean',
            alias:'d'
        },
        help:{
            type: 'boolean',
            alias:'h'
        },
        text:{
            type:'string',
            alias:'t'

        },
        showTime:{
            type: 'boolean',
            alias:'T'
        },
        cssGlyph:{
            type: 'boolean',
        },
        basicText:{
            type: 'boolean',
            alias:'b'
        },
        fontFamily:{
            type: 'string'
        }

    }
});

// version
if (cli.flags.version) {
    console.log('1.0.3');
    process.exit(0);
}

function isFile(path) {
    if (/^[^\s]+\.\w*$/.test(path)) {
        return true;
    }

    try {
        return fs.statSync(path).isFile();
    }
    catch (err) {
        return false;
    }
}


function run(src, dest) {

    cli.flags.showTime && console.time('fontmin use');

    const pluginOpts = _.extend(
        {},
        cli.flags,
        {
            deflate: cli.flags.deflateWoff,
            glyph: cli.flags.cssGlyph
        }
    );

    const fontmin = new Fontmin()
        .src(src)
        .use(Fontmin.otf2ttf(pluginOpts as never))
        .use(Fontmin.glyph(pluginOpts as never))
        .use(Fontmin.ttf2eot(pluginOpts as never))
        .use(Fontmin.ttf2svg(pluginOpts as never))
        .use(Fontmin.ttf2woff(pluginOpts as never))
        .use(Fontmin.ttf2woff2(pluginOpts as never))
        .use(Fontmin.css(pluginOpts));

    if (process.stdout.isTTY) {
        fontmin.dest(dest ? dest : 'build');
    }

    fontmin.run((err, files) => {
        if (err) {
            console.error(err.stack || err);
            process.exit(1);
        }

        if (!process.stdout.isTTY) {
            files.forEach(file => {
                process.stdout.write(file.contents?.toString() as string);
            });
        }

        cli.flags.showTime && console.timeEnd('fontmin use');
    });
}

if (process.stdin.isTTY) {
    let src = cli.input;
    let dest;

    if (!cli.input.length) {
        console.error([
            'Provide at least one file to optimize',
            '',
            'Example',
            '  fontmin font/* build',
            '  fontmin foo.ttf > foo-optimized.ttf',
            '  cat foo.ttf | fontmin > foo-optimized.ttf',
            '',
            'See `fontmin --help` for more information.'
        ].join('\n'));

        process.exit(1);
    }

    if (src.length > 1 && !isFile(src[src.length - 1])) {
        dest = src[src.length - 1];
        src.pop();
    }

    src = src.map(s => {
        if (!isFile(s) && fs.existsSync(s)) {
            return path.join(s, '**/*');
        }

        return s;
    });

    run(src, dest);
}
else {
    stdin.buffer();
}
