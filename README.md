# Comparify
### *Browser-based image comparisons with Canvas*

So, here's a little proof of concept for an idea I had about detecting duplicate images. My only requirements were:

0. Runs in a browser with no external dependencies.
1. The process should be minimally affected by JPEGification. A crappy quality version of a picture should still be considered the same picture as a high res, 25MB version.
2. The process should be minimally effected by image size. A thumbnail of an image should be an identical match.
3. We don't care about file format. A PNG converted to a JPEG, but otherwise unaltered should be an identical match.

Things that comparify DOES NOT deal with include:

1. Images with heavily altered colors. Shift the spectrum a bit and it should work but stray too far and it's no longer going to match. For my purposes, I'd consider that a different image anyway.
2. Images that have been cropped or transformed. It would be nice to deal with this, but currently the algorithm depends entirely on the layout of the image, so a cropped one is going to match badly.

So far it's just a simple drag and drop web app. If you find this useful and want to use it, feel free (MIT license)! `comparify.js` itself should be fairly easy to copy over and use in your own project as long as you're using it in a browser. Node.js support is awkward since Canvas is part of the DOM, but it might be possible to hack in something like [Automattic's node-canvas.](https://github.com/Automattic/node-canvas)

