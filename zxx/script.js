function LayerMerge(canvas, imgs) {
	//	let back = new Image()
	//	let front = new Image()
	//	back.src = srcs[0]
	//	front.src = srcs[1]
	this.canvas = canvas
	this.ctx = canvas.getContext('2d')
	this.back = imgs[0]
	this.backImgData = getImgData.call(this, 'back')
	//	this.backImgData = (()=>{
	//		this.ctx.drawImage(this.back,0,0)
	//		let c = this.canvas
	//		let w = c.width
	//		let h = c.height
	//		let imgData = this.ctx.getImageData(0,0,w ,h)
	//		this.ctx.clearRect(0,0,w,h)
	//		return imgData
	//	})();
	this.front = imgs[1]
	this.frontImgData = getImgData.call(this, 'front')
	//	this.frontImgData = (()=>{
	//		this.ctx.drawImage(this.front,0,0)
	//		let c = this.canvas
	//		let w = c.width
	//		let h = c.height
	//		let imgData = this.ctx.getImageData(0,0,w ,h)
	//		this.ctx.clearRect(0,0,w,h)
	//		return imgData
	//	})();
	function getImgData(imgPos) {
		this.ctx.drawImage(this[imgPos], 0, 0)
		let c = this.canvas
		let w = c.width
		let h = c.height
		let imgData = this.ctx.getImageData(0, 0, w, h)
		this.ctx.clearRect(0, 0, w, h)
		return imgData
	}
}
LayerMerge.prototype._process = function(process) {
	let bd = this.backImgData.data
	let fd = this.frontImgData.data
	//复制背景那图片的元素
	let newImgData = this.ctx.createImageData(this.backImgData)
	let newData = newImgData.data
	newData.set(bd)
	let newPix = ''
	for(let i = 0; i < bd.length; i += 4) {
		if(bd[i + 3] == 0) continue
		if(typeof process == 'function') {
			//			console.log(i)
			newPix = process({
				r: bd[i],
				g: bd[i + 1],
				b: bd[i + 2],
				a: bd[i + 3]
			}, {
				r: fd[i],
				g: fd[i + 1],
				b: fd[i + 2],
				a: fd[i + 3]
			})
			//			console.log(newPix)
			newData[i] = newPix.r;
			newData[i + 1] = newPix.g;
			newData[i + 2] = newPix.b;
		}
	}

	console.log('_process xx')
	console.log(newImgData)
	this.ctx.putImageData(newImgData, 0, 0)
	console.log(this.ctx.putImageData)
	console.log(this.ctx.getImageData(0, 0, 300, 442))
}

LayerMerge.prototype.xx = function() {
	this._process()
}
LayerMerge.prototype.normal = function() {
	this._process(function(b, f) {
		var alpha = f.a
		return {
			r: f.r * alpha + b.r * (1 - alpha),
			g: f.g * alpha + b.g * (1 - alpha),
			b: f.b * alpha + b.b * (1 - alpha),
			a: f.a * alpha + b.a * (1 - alpha)
		}
	})
}

LayerMerge.prototype.dissolve = function() {
	this._process(function(b, f) {
		if(Math.floor(Math.random() * 100) > 50) {
			return b;
		} else {
			return f;
		}
	})
}

LayerMerge.prototype.darken = function() {
	this._process(function(b, f) {
		return {

			r: Math.min(b.r, f.r),
			g: Math.min(b.g, f.g),
			b: Math.min(b.b, f.b),
			a: Math.min(b.a, f.a)
		}
	})
}

LayerMerge.prototype.multiply = function() {
	this._process(function(b, f) {
		return {
			r: f.r * b.r / 255,
			g: f.g * b.g / 255,
			b: f.b * b.b / 255,
			a: f.a * b.a / 255
		}
	})
}
LayerMerge.prototype.overlay = function() {
	this._process(function(b, f) {
		return {
			r: 255 - (255 - f.r) * (255 - b.r) / 128,
			g: 255 - (255 - f.g) * (255 - b.g) / 128,
			b: 255 - (255 - f.b) * (255 - b.b) / 128,
			a: 255 - (255 - f.a) * (255 - b.a) / 128
		}
	})
}
LayerMerge.prototype.colorBurn = function() {
	this._process(function(b, f) {
		return {
			r: Math.max(0, b.r + f.r - 255) * 255 / f.r,
			g: Math.max(0, b.g + f.g - 255) * 255 / f.g,
			b: Math.max(0, b.b + f.b - 255) * 255 / f.b,
			a: Math.max(0, b.a + f.a - 255) * 255 / f.a
		}
	})
}
LayerMerge.prototype.linearBurn = function() {
	this._process(function(b, f) {
		return {

			r: Math.max(0, b.r + f.r - 255),
			g: Math.max(0, b.g + f.g - 255),
			b: Math.max(0, b.b + f.b - 255),
			a: Math.max(0, b.a + f.a - 255)
		}
	})
}

LayerMerge.prototype.darkerColor = function() {
	this._process(function(b, f) {
		if((b.r + b.g + b.b + b.a) < (f.r + f.g + f.b + f.a)) {
			return b;
		} else {
			return f;
		}
	})
}

LayerMerge.prototype.lighten = function() {
	this._process(function(b, f) {
		return {
			r: Math.max(b.r, f.r),
			g: Math.max(b.g, f.g),
			b: Math.max(b.b, f.b),
			a: Math.max(b.a, f.a)
		}
	})
}
LayerMerge.prototype.screen = function() {
	this._process(function(b, f) {
		return {

			r: 255 - (255 - f.r) * (255 - b.r) / 255,
			g: 255 - (255 - f.g) * (255 - b.g) / 255,
			b: 255 - (255 - f.b) * (255 - b.b) / 255,
			a: 255 - (255 - f.a) * (255 - b.a) / 255
		}
	})
}

LayerMerge.prototype.colorDodge = function() {
	this._process(function(b, f) {
		return {
			r: b.r + f.r * b.r / (255 - f.r),
			g: b.g + f.g * b.g / (255 - f.g),
			b: b.b + f.b * b.b / (255 - f.b),
			a: b.a + f.a * b.a / (255 - f.a)
		}
	})
}
LayerMerge.prototype.linearDodge = function() {
	this._process(function(b, f) {
		return {
			r: Math.min(b.r + f.r, 255),
			g: Math.min(b.g + f.g, 255),
			b: Math.min(b.b + f.b, 255),
			a: Math.min(b.a + f.a, 255)
		}
	})
}

LayerMerge.prototype.lighterColor = function() {
	this._process(function(b, f) {

		if((b.r + b.g + b.b + b.a) > (f.r + f.g + f.b + f.a)) {
			return b;
		} else {
			return f;
		}
	})
}
LayerMerge.prototype.softLight = function() {
	this._process(function(b, f) {
		return {
			r: b.r + (2 * f.r - 255) * (Math.sqrt(b.r / 255) * 255 - b.r) / 255,
			g: b.g + (2 * f.g - 255) * (Math.sqrt(b.g / 255) * 255 - b.g) / 255,
			b: b.b + (2 * f.b - 255) * (Math.sqrt(b.b / 255) * 255 - b.b) / 255,
			a: b.a + (2 * f.a - 255) * (Math.sqrt(b.a / 255) * 255 - b.a) / 255
		};
	})
}

LayerMerge.prototype.hardLight = function() {
	this._process(function(b, f) {
		return {

			r: f.r > 128 ? 255 - (255 - f.r) * (255 - b.r) / 128 : f.r * b.r / 128,
			g: f.g > 128 ? 255 - (255 - f.g) * (255 - b.g) / 128 : f.g * b.g / 128,
			b: f.b > 128 ? 255 - (255 - f.b) * (255 - b.b) / 128 : f.b * b.b / 128,
			a: f.a > 128 ? 255 - (255 - f.a) * (255 - b.a) / 128 : f.a * b.a / 128

		};
	})
}

LayerMerge.prototype.vividLight = function() {
	this._process(function(b, f) {
		return {
			r: f.r <= 128 ? 255 - (255 - b.r) / (2 * f.r) * 255 : b.r / (2 * (255 - f.r)) * 255,
			g: f.g <= 128 ? 255 - (255 - b.g) / (2 * f.g) * 255 : b.g / (2 * (255 - f.g)) * 255,
			b: f.b <= 128 ? 255 - (255 - b.b) / (2 * f.b) * 255 : b.b / (2 * (255 - f.b)) * 255,
			a: f.a <= 128 ? 255 - (255 - b.a) / (2 * f.a) * 255 : b.a / (2 * (255 - f.a)) * 255

		};
	})
}

LayerMerge.prototype.linearLight = function() {
	this._process(function(b, f) {
		return {
			r: Math.min(2 * f.r + b.r - 255, 255),
			g: Math.min(2 * f.g + b.g - 255, 255),
			b: Math.min(2 * f.b + b.b - 255, 255),
			a: Math.min(2 * f.a + b.a - 255, 255)
		};
	})
}

// LayerMerge.prototype.pinLight  = function () {
// this._process(function(b, f) {

// if (typeof pixProcesser.pinLightProcess == "undefined") {
// pixProcesser.pinLightProcess = function (sourceColor, blendColor) {
// return blendColor <= 128 ? Math.min(sourceColor, 2 * blendColor) : Math.max(sourceColor, 2 * blendColor - 255);
// };
// }

// return {
// r: pixProcesser.pinLightProcess(b.r, f.r),
// g: pixProcesser.pinLightProcess(b.g, f.g),
// b: pixProcesser.pinLightProcess(b.b, f.b),
// a: pixProcesser.pinLightProcess(b.a, f.a)
// };
// })
// }

LayerMerge.prototype.hardMix = function() {
	this._process(function(b, f) {
		return {
			r: (b.r + f.r) < 255 ? 0 : 255,
			g: (b.g + f.g) < 255 ? 0 : 255,
			b: (b.b + f.b) < 255 ? 0 : 255,
			a: (b.a + f.a) < 255 ? 0 : 255
		};
	})
}

LayerMerge.prototype.difference = function() {
	this._process(function(b, f) {
		return {

			r: Math.abs(f.r - b.r),
			g: Math.abs(f.g - b.g),
			b: Math.abs(f.b - b.b),
			a: Math.abs(f.a - b.a)
		};
	})
}
LayerMerge.prototype.exclusion = function() {
	this._process(function(b, f) {
		return {
			r: (f.r + b.r) - f.r * b.r / 128,
			g: (f.g + b.g) - f.g * b.g / 128,
			b: (f.b + b.b) - f.b * b.b / 128,
			a: (f.a + b.a) - f.a * b.a / 128
		};
	})
}

LayerMerge.prototype.subtract = function() {
	this._process(function(b, f) {
		return {
			r: Math.max(0, b.r - f.r),
			g: Math.max(0, b.g - f.g),
			b: Math.max(0, b.b - f.b),
			a: Math.max(0, b.a - f.a)
		};
	})
}
LayerMerge.prototype.divide = function() {
	this._process(function(b, f) {
		return {
			r: (b.r / f.r) * 255,
			g: (b.g / f.g) * 255,
			b: (b.b / f.b) * 255,
			a: (b.a / f.a) * 255
		};
	})
}