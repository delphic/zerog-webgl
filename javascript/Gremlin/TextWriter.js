var TextWriter = function() {
	function _getPowerOfTwo(value, pow) {
		var pow = pow || 1;
		while(pow<value) {
			pow *= 2;
		}
		return pow;
	}

	function _measureText(ctx, textToMeasure) {
		return ctx.measureText(textToMeasure).width;
	}

	function _createMultilineText(ctx, textToWrite, maxWidth, text) {
		// TODO: take account of new line / carriage returns in splitting lines
		var currentText = textToWrite;
		var futureText;
		var subWidth = 0;
		var maxLineWidth = 0;

		var wordArray = textToWrite.split(" ");
		var wordsInCurrent, wordArrayLength;
		wordsInCurrent = wordArrayLength = wordArray.length;

		while (_measureText(ctx, currentText) > maxWidth && wordsInCurrent > 1) {
			wordsInCurrent--;
			var linebreak = false;

			currentText = futureText = "";
			for(var i = 0; i < wordArrayLength; i++) {
				if (i < wordsInCurrent) {
					currentText += wordArray[i];
					if (i+1 < wordsInCurrent) { currentText += " "; }
				}
				else {
					futureText += wordArray[i];
					if( i+1 < wordArrayLength) { futureText += " "; }
				}
			}
		}
		text.push(currentText);
		maxLineWidth = _measureText(ctx, currentText);

		if(futureText) {
			subWidth = _createMultilineText(ctx, futureText, maxWidth, text);
			if (subWidth > maxLineWidth) { 
				maxLineWidth = subWidth;
			}
		}

		return maxLineWidth;
	}

	function drawText(textToWrite, textHeight, textAlignment, textColour, fontFamily, maxWidth, canvasId) {
		var canvasX, canvasY;
		var textX, textY;

		var text = [];

		var canvas = document.getElementById(canvasId);
		var ctx = canvas.getContext('2d');

		ctx.font = textHeight+"px "+fontFamily;
		if (maxWidth && _measureText(ctx, textToWrite) > maxWidth ) {
			maxWidth = _createMultilineText(ctx, textToWrite, maxWidth, text);
			canvasX = _getPowerOfTwo(maxWidth);
		} else {
			text.push(textToWrite);
			canvasX = _getPowerOfTwo(ctx.measureText(textToWrite).width);
		}
		canvasY = _getPowerOfTwo(textHeight*(text.length+1));

		canvas.width = canvasX;
		canvas.height = canvasY;

		switch(textAlignment) {
			case "left":
				textX = 0;
				break;
			case "center":
				textX = canvasX/2;
				break;
			case "right":
				textX = canvasX;
				break;
		}
		textY = canvasY/2;	

		ctx.fillStyle = "rgba(0,0,0,0)"; //TODO: Argument
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		ctx.fillStyle = textColour;
		ctx.textAlign = textAlignment;

		ctx.textBaseline = 'middle'; // top, middle, bottom
		ctx.font = textHeight+"px "+fontFamily;

		var offset = (canvasY - textHeight*(text.length+1)) * 0.5;

		for(var i = 0; i < text.length; i++) {
			if(text.length > 1) {
				textY = (i+1)*textHeight + offset;
			}
			ctx.fillText(text[i], textX,  textY);
		}

		return [canvasX, canvasY];
	}

	return {
		drawText: 		drawText
	}
}();