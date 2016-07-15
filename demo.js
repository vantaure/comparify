// Initialize Comparify
var cpfy = new Comparify({
	'resolution': 16,
	'fast': false
});

/****************************************
	  Stuff specific to this page.
****************************************/

var q = document.querySelector.bind(document);

var el = {
	button: q('#comparebutton'),
	zone1: q('.dropzone.image1'),
	zone2: q('.dropzone.image2'),
	img1: q('#image-display-1'),
	img2: q('#image-display-2'),
	sig1: q('#signature-1'),
	sig2: q('#signature-2'),
	result: q('#result-percent')
}

if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
	el.result.textContent = 'Your browser doesn\'t support the HTML File APIs, so this demo isn\'t going to work. :(';
}

var slot1 = null;
var slot2 = null;

function prevent(e) {
	e.preventDefault();
	e.stopPropagation();
	return false;
}

document.addEventListener('dragover', prevent);
document.addEventListener('drop', prevent);

// Get image data on drop.

function handleImage(e, callback) {
	var file = e.dataTransfer.files[0];
	if (file) {
		if (!file.type.match('image.*')) {
			el.result.textContent = 'That\'s not an image! ☃';
		}

		var reader = new FileReader();

		reader.onload = (function(f, c) {
			return function(e) {
				c(e.target.result);
			}
		})(file, callback);

		reader.readAsDataURL(file);
	}
	prevent(e);
}

el.zone1.addEventListener('drop', function(e) {
	handleImage(e, function(img) {
		slot1 = img;
		el.img1.src = img;
	});
});

el.zone2.addEventListener('drop', function(e) {
	handleImage(e, function(img) {
		slot2 = img;
		el.img2.src = img;
	});
});

function drawSignature(el, sig) {
	requestAnimationFrame(function() {
		var size = 100 / Math.sqrt(sig.length);

		while(el.lastChild) {
			el.removeChild(el.lastChild);
		}

		var frag = document.createDocumentFragment();
		for (var i = 0; i < sig.length; i++) {
			var tile = document.createElement('div');
			tile.classList.add('sig-tile');

			tile.style.background = 'rgba('+sig[i].r+', '+sig[i].g+', '+sig[i].b+', '+sig[i].a+')';
			tile.style.width = tile.style.height = size + '%';

			frag.appendChild(tile);
		}

		el.appendChild(frag);
	});
}

var algo = 'duplicate';

/****************************************
	    Actual usage of the API
****************************************/

el.button.addEventListener('click', function(e) {
	if (slot1 && slot2) {
		cpfy.getSignature(slot1, function(sig1) {
			drawSignature(el.sig1, sig1);

			cpfy.getSignature(slot2, function(sig2) {
				drawSignature(el.sig2, sig2);

				cpfy.compare(sig1, sig2, algo, function(result) {
					var text = result+'% match.';

					if (typeof algo === 'string') {
						if (algo === 'duplicate') {
							if (result > 99) { text += ' Dawg, this is the same picture...'; }
							else if (result > 96) { text += ' This is almost certainly a duplicate.'; }
							else if (result > 93) { text += ' This is probably a duplicate.'; }
							else if (result > 80) { text += ' Similar color palette perhaps.'; }
							else { text += ' Definitely not a duplicate.'; }
						} else if (algo === 'alternate') {
							// Messages for alternate detection algorithm.
						}
					}

					el.result.textContent = text;
				})
			});
		});
	} else {
		console.warn(slot1, slot2);
		el.result.textContent = 'Make sure you\'ve dropped an image on each zone before you start.';
	}
});
