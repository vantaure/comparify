window.Comparify = (function() {
	var resolution = 20;

	// Internal methods

	function rgbaParse(cell) {
		var rgbArray = [];
		var i = 0;

		while (i < cell.data.length) {
			rgbArray.push({
				r: cell.data[i],
				g: cell.data[i+1],
				b: cell.data[i+2],
				a: cell.data[i+3]
			});

			i += 4;
		}

		return rgbArray;
	}

	function average(cellData) {
		// Average the pixel colors in a cell into one color value.

		var total = {
			r: 0,
			g: 0,
			b: 0,
			a: 0
		};

		var pixels = rgbaParse(cellData);
		var l = pixels.length;

		for (var i = 0; i < l; i++) {
			var p = pixels[i];

			total.r += p.r;
			total.g += p.g;
			total.b += p.b;
			total.a += p.a;
		}

		return {
			r: parseInt(total.r / l),
			g: parseInt(total.g / l),
			b: parseInt(total.g / l),
			a: parseInt(total.a / l)
		};
	}

	function cellularize(canvas, image, callback) {
		// Divide the image into cells.

		var cellStart = Date.now();

		var ctx = canvas.getContext('2d');
		var img = new Image();
		var cells = [];

		img.onload = function(e) {
			var cellWidth = img.width / resolution;
			var cellHeight = img.height / resolution;

			canvas.width = img.width;
			canvas.height = img.height;

			var loopStart = Date.now();

			ctx.drawImage(img, 0, 0);

			// This loop is the biggest performance bottleneck, I think
			// just because there are so many pieces. 0.5ms * 400 is 200ms...

			for (var y = 0; y < resolution; y++) {
				var ycoord = cellHeight * y;

				for (var x = 0; x < resolution; x++) {
					var xcoord = cellWidth * x;

					cells.push(average(ctx.getImageData(xcoord, ycoord, cellWidth, cellHeight)));
				}
			}

			console.log(`Slowlooped in ${Date.now() - loopStart}ms.`);

			return callback(cells);
		};

		img.src = image;
	}

	/**************************************
				   Algorithms
	**************************************/

	var algo = {
		// An algorithm can do literally anything as long at it takes
		// two signatures as input and returns a percentage as output.

		'duplicate': function(sig1, sig2) {
			var confidences = [];

			for (var i = 0; i < sig1.length; i++) {
				var r = Math.abs(sig1[i].r - sig2[i].r) / 255;
				var g = Math.abs(sig1[i].g - sig2[i].g) / 255;
				var b = Math.abs(sig1[i].b - sig2[i].b) / 255;

				var avr = parseInt((r + g + b) / 3 * 100);

				confidences.push(100 - avr);
			}

			return Math.min.apply(null, confidences);
		}
	}


	// Constructor

	function Comparify(opts) {
		if (opts) {
			if (opts.resolution) { resolution = opts.resolution; }
			if (opts.fast) { fast = opts.fast; }
		}

		this.canvas = document.createElement('canvas');
	}

	// Public methods

	Comparify.prototype.getSignature = function(image, callback) {
		return cellularize(this.canvas, image, callback);
	}

	Comparify.prototype.compare = function(sig1, sig2, algorithm, callback) {
		// Runs two signatures through the specified algorithm, which processes them and returns a percentage confidence rating.

		if (sig1.length !== sig2.length) {
			throw new Error('Both signatures need to be the same resolution to properly compare.');
		}

		if (!algorithm) {
			throw new Error('Must specify an algorithm as the third parameter. This can be a string (for an internal algo) or a function, to use your own.');
		} else if (typeof algorithm === 'string') {
			if (algo[algorithm]) {
				algorithm = algo[algorithm];
			} else {
				throw new Error('Unknown algorithm: '+algorithm);
			}
		}

		return callback(algorithm(sig1, sig2));
	}

	return Comparify;
})();
