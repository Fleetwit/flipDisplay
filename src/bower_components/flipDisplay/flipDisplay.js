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
		
		console.log("container",container);
		
		this.container 	= container;
		
		this.container.addClass("flipDisplay").addClass(this.options.size);
		this.displays	= [];
		
		this.sizeSettings = {
			medium:	{
				number:		52,
				special:	6
			},
			large:	{
				number:		77,
				special:	6
			},
			small:	{
				number:		35,
				special:	6
			},
			tiny:	{
				number:		24,
				special:	6
			}
		};
	};
	flipDisplay.prototype.displayTime = function(time) {
		var dhms = this.formatTime(time);
	};
	flipDisplay.prototype.display = function(str, options) {
		var scope = this;
		var parts = str.split('');
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
			scope.displayPart(part, index);
			index++;
		});
	};
	flipDisplay.prototype.createCell = function() {
		console.log("creating new cell");
		var div = dom("div", this.container);
			div.data('flipValue', 0);
			div.hide().fadeIn();
		this.displays.push(div);
		return div;
	};
	flipDisplay.prototype.displayPart = function(n, index) {
		var scope = this;
		
		var div = this.displays[index];
		
		if (div.data('flipValue').toString() == n.toString()) {
			return false;
		}
		
		var currentValue = div.data('flipValue')*1;
		
		// Calculate the positions
		var pos = {
			start:	currentValue*this.sizeSettings[this.options.size].number*6*-1,
			end:	n*this.sizeSettings[this.options.size].number*6*-1
		};
		pos.current = pos.start;
		var steps 		= Math.abs(n-currentValue)*6;
		var stepSize	= (pos.end-pos.start)/steps;
		
		console.log("From "+currentValue+" to "+n, pos, "Steps: "+steps, "stepSize: "+stepSize);
		
		if (steps > 0) {
			var c = 0;
			var itv = setInterval(function() {
				
				pos.current += stepSize;
				
				div.css('background-position', '0px '+pos.current+'px');
				
				
				// Counter and interval break
				if (pos.current == pos.end) {
					clearInterval(itv);
					div.data('flipValue', n);
				}
				c++;
			}, this.options.speed/steps);
		}
	};
	flipDisplay.prototype.formatTime = function(seconds) {
		var days 		= Math.floor(seconds / 86400);
		hours 			= seconds - days * 86400;
		var hours 		= Math.floor(seconds / 3600);
		seconds 		= seconds - hours * 3600;
		var minutes 	= Math.floor(seconds/60);
		var seconds 	= seconds % 60;
		seconds 		= Math.round(seconds);
		var timestring 	= [days,hours,minutes,seconds];
		return timestring;
	};
	flipDisplay.prototype.formatNumber = function(number) {
		return number<=9?"0"+number:number.toString();
	};
	// Global scope
	window.flipDisplay 		= flipDisplay;
})();