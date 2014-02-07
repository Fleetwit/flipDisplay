(function() {
	
	// Utility, to create new dom elements
	var dom = function(nodeType, appendTo, raw) {
		var element = document.createElement(nodeType);
		if (appendTo != undefined) {
			$(appendTo).append($(element));
		}
		return (raw === true)?element:$(element);
	};
	
	var flipDisplay = function(container, options) {
		this.options = _.extend({
			size:	"medium",
			speed:	500
		}, options);
		
		this.container 	= container;
		
		this.container.addClass("flipDisplay").addClass(this.options.size);
		this.displays	= [];
		
		this.sizeSettings = {
			large:	{
				width:		53,
				number:		77,
				colon:		[20, 12],
				comma:		[41, 12]
			},
			medium:	{
				width:		36,
				number:		52,
				colon:		[14, 8],
				comma:		[28, 8]
			},
			small:	{
				width:		24,
				number:		35,
				colon:		[8, 7],
				comma:		[18, 7]
			},
			tiny:	{
				width:		16,
				number:		24,
				colon:		[5, 5],
				comma:		[12, 5]
			}
		};
	};
	flipDisplay.prototype.displayTime = function(time, skipAnimation, auto) {
		var dhms = this.formatTime(time*1);
		
		if (auto) {
			var i;
			var l = dhms.length;
			for (i=0;i<l;i++) {
				if (dhms[i] > 0) {
					dhms = dhms.slice(i);
					break;
				}
				if (i == l-1 && dhms[i] == 0) {
					dhms = dhms.slice(l-1);
				}
			}
		}
		
		this.display(dhms.join(":"), skipAnimation);
	};
	flipDisplay.prototype.display = function(str, skipAnimation) {
		var scope = this;
		var parts = str.toString().split('');
		var index = 0;
		// Remove the cells if there are too many
		if (this.displays.length > parts.length) {
			var removeList = this.displays.slice(parts.length);
			_.each(removeList, function(el) {
				el.fadeOut(function() {
					el.remove();
				});
			});
			this.displays = this.displays.slice(0, parts.length);
		}
		_.each(parts, function(part) {
			// Create the cells if there are some missing
			if (!scope.displays[index]) {
				scope.createCell();
			}
			scope.displayPart(part, index, skipAnimation);
			index++;
		});
	};
	flipDisplay.prototype.createCell = function() {
		var div = dom("div", this.container);
			div.data('flipValue', 0);
			div.hide().fadeIn();
		this.displays.push(div);
		return div;
	};
	flipDisplay.prototype.displayPart = function(n, index, skipAnimation) {
		var scope = this;
		
		var div = this.displays[index];
		
		if (div.data('flipValue').toString() == n.toString()) {
			return false;
		}
		
		var currentValue = div.data('flipValue')*1;
		
		// Calculate the positions
		if (n >= 0 && n <= 9) {
			var pos = {
				start:	currentValue*this.sizeSettings[this.options.size].number*6*-1,
				end:	n*this.sizeSettings[this.options.size].number*6*-1
			};
			pos.current 	= pos.start;
			var steps 		= Math.abs(n-currentValue)*6;
			var stepSize	= (pos.end-pos.start)/steps;
			
			if (skipAnimation) {
				div.css({
					'background-position':	'0px '+pos.end+'px',
					width:					scope.sizeSettings[this.options.size].width
				});
				div.data('flipValue', n);
			} else {
				if (steps > 0) {
					var c = 0;
					var itv = setInterval(function() {
						
						pos.current += stepSize;
						
						div.css({
							'background-position':	'0px '+pos.current+'px',
							width:					scope.sizeSettings[scope.options.size].width
						});
						
						
						// Counter and interval break
						if (pos.current == pos.end) {
							clearInterval(itv);
							div.data('flipValue', n);
						}
						c++;
					}, this.options.speed/steps);
				}
			}
		} else {
			if (n == ":") {
				div.css({
					'background-position':	(this.sizeSettings[this.options.size].colon[0]*-1)+'px '+(((10*this.sizeSettings[this.options.size].number*6))*-1)+'px',
					width:					this.sizeSettings[this.options.size].colon[1]
				});
				div.data('flipValue', 10);
			}
			if (n == ".") {
				div.css({
					'background-position':	(this.sizeSettings[this.options.size].comma[0]*-1)+'px '+(((10*this.sizeSettings[this.options.size].number*6))*-1)+'px',
					width:					this.sizeSettings[this.options.size].comma[1]
				});
				div.data('flipValue', 10);
			}
		}
	};
	flipDisplay.prototype.formatTime = function(seconds) {
		var days 		= Math.floor(seconds / 86400);
		seconds 		= seconds - days * 86400;
		var hours 		= Math.floor(seconds / 3600);
		seconds 		= seconds - hours * 3600;
		var minutes 	= Math.floor(seconds/60);
		var seconds 	= seconds % 60;
		seconds 		= Math.round(seconds);
		var timestring 	= [days,this.formatNumber(hours),this.formatNumber(minutes),this.formatNumber(seconds)];
		return timestring;
	};
	flipDisplay.prototype.formatNumber = function(number) {
		return number<=9?"0"+number:number.toString();
	};
	// Global scope
	window.flipDisplay 		= flipDisplay;
})();