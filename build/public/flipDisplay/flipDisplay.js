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
	flipDisplay.prototype.displayTime = function(time, options) {
		
		options = _.extend({
			animate:	true,	// Animate the display
			autosize:	false,	// Remove empty data
			length:		false,	// max length,
			format:		'd:h:m:s'
		},options);
		
		var i;
		
		time = time.toString().replace(/[^0-9\:\.]/g, "");
		
		var dhms = this.formatTime(time*1);
		
		var map = {
			d:	0,
			h:	1,
			m:	2,
			s:	3
		};
		
		var format_split 	= options.format.split(':');
		var filtered 		= [];
		_.each(format_split, function(formatRule) {
			if (map[formatRule] != undefined) {
				filtered.push(dhms[map[formatRule]]);
			}
		});
		
		if (options.autosize) {
			var l = filtered.length;
			for (i=0;i<l;i++) {
				if (filtered[i] > 0) {
					filtered = filtered.slice(i);
					break;
				}
				if (i == l-1 && filtered[i] == 0) {
					filtered = filtered.slice(l-1);
				}
			}
		}
		
		if (options.length && filtered.length > options.length) {
			for (i=0;i<filtered.length;i++) {
				if (filtered[i]*1 > 0) {
					filtered = filtered.slice(i, i+options.length*1);
					console.log("slice",i, i+options.length*1);
					break;
				}
				
			}
		}
		
		if (options.length && filtered.length < options.length) {
			for (i=0;i<(options.length-filtered.length);i++) {
				filtered.splice(0,0,this.formatNumber(0))
			}
		}
		
		
		this.display(filtered.join(":"), options);
	};
	flipDisplay.prototype.display = function(str, options) {
		
		options = _.extend({
			animate:	true
		},options);
		
		str = str.replace(/[^0-9\:\.]/g, "");
		
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
			scope.displayPart(part, index, options);
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
	flipDisplay.prototype.resize = function(size) {
		var scope = this;
		
		this.options.size = size;
		
		this.container.removeClass("tiny").removeClass("small").removeClass("medium").removeClass("large").addClass(size);
		
		this.container.children().each(function(index, el) {
			scope.draw($(el), $(el).data('flipRealValue'), {
				redraw:	true
			});
		});
	};
	flipDisplay.prototype.displayPart = function(n, index, options) {
		
		options = _.extend({
			animate:	true
		},options);
		
		var scope = this;
		
		var div = this.displays[index];
		
		// Store the real value, even if it's invalid (for redraw)
		div.data('flipRealValue', n);
		
		this.draw(div, n, options);
	};
	flipDisplay.prototype.draw = function(div, n, options) {
		
		options = _.extend({
			animate:	true,
			redraw:		false
		},options);
		
		var scope = this;
		
		if (div.data('flipValue').toString() == n.toString() && !options.redraw) {
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
			
			
			if (!options.animate || options.redraw) {
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