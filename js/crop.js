(function (win, doc) {
	doc.onselectstart = function () {
		return false;
	};
	doc.ondragstart = function () {
		return false;
	};

	var app = angular.module('imgCropApp', []);

	app.factory('ImgData', function () {
		return {
			width: 640,
			height: 480,
			src: "http://lorempixel.com/640/480/nature"
		};
	});

	app.factory('CanvasService', ['$window', function ($window) {
		var offScreenCanvas = document.createElement('canvas'),
			offScreenContext = offScreenCanvas.getContext('2d');
		return {
			$el: null,
			el: null,
			ctx: null,
			offCnv: offScreenCanvas,
			offCtx: offScreenContext,
			getCropAreaCoords: function (bbox) {
				var offset = this.$el.offset(),
					offsetX = offset.left,
					offsetY = offset.top;
				return [bbox.x - offsetX, bbox.y - offsetY, bbox.width, bbox.height];
			},
			getOverlap: function (bbox) {
				var offset = this.$el.offset();
				var	w = this.el.width,
					h = this.el.height,
					left = bbox.x - offset.left,
					right = w - left - bbox.width,
					top = bbox.y - offset.top,
					bottom = h - top - bbox.height;

				var overX = Math.max(Math.min(left, w), 0);
				var overY = Math.max(Math.min(top, h), 0);
				var overW = w - Math.max(right, 0) - Math.max(left, 0);
				var overH = h - Math.max(bottom, 0) - Math.max(top, 0);

				overW = Math.max(overW, 0);
				overH = Math.max(overH, 0);

				return [overX, overY, overW, overH];
			},
			makeCrop: function (bbox) {
				var coords = this.getOverlap(bbox);
				var bmpData = this.ctx.getImageData.apply(this.ctx, coords);
				this.offCnv.width = coords[2];
				this.offCnv.height = coords[3];
				this.offCtx.putImageData.apply(this.offCtx, [bmpData, 0, 0]);
				$window.open(this.offCnv.toDataURL(), '_blank');
			}
		};
	}]);

	app.factory('BoundBoxData', ['$document', function ($document) {
		var clientRect = $document.find('body').get(0).getBoundingClientRect();
		var w = 200, h = 200;
		var x = (clientRect.width / 2 - w / 2 + clientRect.left) >> 0;
		var y = (clientRect.height / 2 - h / 2 + clientRect.top) >> 0;
		return {
			x: x, y: y,
			width: w, height: w
		};
	}]);

	app.directive('autocrop', function () {
		return {
			restrict: 'E',
			replace: true,
			scope: true,
			templateUrl: 'templates/autocrop.html',
			controller: function ($scope, $document, BoundBoxData) {
				var maxX, maxY;
				$scope.activePoint = null;
				$scope.activePointOffset = null;
				$scope.startCoord = {x: 0, y: 0};
				$scope.lastCoord = {x: 0, y: 0};
				$scope.bbox = BoundBoxData;

				$scope.onBBPointDragStart = function (el, event) {
					var x = event.pageX,
						y = event.pageY;
					$scope.activePoint = el;
					$scope.activePointOffset = el
						.getAttribute('data-offset')
						.split(',')
						.map(function (item) {
							return parseInt(item);
						});

					maxX = x + $scope.bbox.width;
					maxY = y + $scope.bbox.height;

					$document.bind('mousemove.bbpoint', function (e) {
						$scope.onBBPointMove(e);
					});
					$document.bind('mouseup.bbpoint', function (e) {
						$scope.onBBPointDragEnd(e);
					});
				};
				$scope.onBBPointMove = function (e) {
					var offset = $scope.activePointOffset;
					if (!!$scope.activePoint) {
						$scope.$apply(function () {
							var x = $scope.bbox.x,
								y = $scope.bbox.y,
								w = $scope.bbox.width,
								h = $scope.bbox.height;
							if (offset[0] === 0 && offset[1] === 0) {
								x = e.pageX - w/2;
								y = e.pageY - h/2;
							} else {
								if (offset[0] === -1) {
									x = e.pageX < maxX ? e.pageX : maxX;
									w = maxX - e.pageX;
								}
								if (offset[1] === -1) {
									y = e.pageY < maxY ? e.pageY : maxY;
									h = maxY - e.pageY;
								}
								if (offset[0] === 1) {
									w = e.pageX - x;
								}
								if (offset[1] === 1) {
									h = e.pageY - y;
								}
							}
							$scope.bbox.x = x;
							$scope.bbox.width = w > 0 ? w : 0;
							$scope.bbox.y = y;
							$scope.bbox.height = h > 0 ? h : 0;
						});
					}
				};
				$scope.onBBPointDragEnd = function (e) {
					if (!!$scope.activePoint) {
						$scope.activePoint = null;
						$scope.activePointOffset = null;
						$scope.$apply(function () {
							$scope.bbox.width = $scope.bbox.width >= 0 ? $scope.bbox.width : 0;
							$scope.bbox.height = $scope.bbox.height >= 0 ? $scope.bbox.height : 0;
						});
					}
					$document.unbind('mousemove.bbpoint');
					$document.unbind('mouseup.bbpoint');
				}
			}
		};
	});

	app.directive('bbPoint', function ($document) {
		return {
			restrict: 'A',
			require: '^autocrop',
			link: function (scope, element) {
				element.bind('mousedown', function (e) {
					scope.onBBPointDragStart(this, e);
				});
			}
		}
	});

	app.directive('imgCanvas', ['$window', function ($window) {
		return {
			restrict: 'A',
			scope: true,
			controller: function ($scope, $element) {
				console.log($element);
				$scope.cnvService.$el = $element;
				$scope.cnvService.el = $scope.cnv = $element.get(0);
				$scope.cnvService.ctx = $scope.ctx = $scope.cnv.getContext('2d');
				$scope.imgEl = new Image();

				$scope.imgEl.onload = function () {
					$scope.drawCycle();
				};
				$scope.drawCycle = function () {
					this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
					this.drawCropArea();
					this.drawImg();
				};
				$scope.drawImg = function () {
					this.ctx.save();
					this.ctx.globalCompositeOperation = "destination-over";
					this.ctx.drawImage(this.imgEl, 0, 0, this.cnv.width, this.cnv.height);
					this.ctx.restore();
				};
				$scope.drawCropArea = function () {
					var coords = this.cnvService.getCropAreaCoords(this.bbox);
					this.ctx.save();
					this.ctx.globalAlpha = 0.6;
					this.ctx.fillStyle = '#33bb33';
					this.ctx.fillRect(0, 0, this.cnv.width, this.cnv.height);
					this.ctx.clearRect.apply(this.ctx, coords);
					this.ctx.restore();
				};
			},
			link: function (scope, element) {
				scope.$watchCollection('imgData', function (newData) {
					console.log('img changes!');
					scope.imgEl.src = newData.src + '?t=' + Date.now();
					scope.imgEl.width = newData.width;
					scope.imgEl.height = newData.height;
				});
				scope.$watchCollection('bbox', function (newData) {
					scope.drawCycle();
				});
				$($window).on('resize', function () {
					scope.drawCycle();
				});
			}
		}
	}]);

	app.controller('ImgEditorCtrl', function ($scope, ImgData, BoundBoxData, CanvasService) {
		$scope.imgData = ImgData;
		$scope.bbox = BoundBoxData;
		$scope.cnvService = CanvasService;
	});

	app.controller('ImgLoaderCtrl', function ($scope, ImgData) {
		$scope.imgData = ImgData;
	});

	app.controller('BoundBoxCtrl', function ($scope, $document, BoundBoxData, CanvasService) {
		$scope.bbox = BoundBoxData;
		$scope.cnvService = CanvasService;
		$scope.boxOutBounds = function () {
			var overlap = this.cnvService.getOverlap(this.bbox);
			return !(overlap[2] && overlap[3]);
		};
		$scope.makeCrop = function () {
			this.cnvService.makeCrop(this.bbox);
		}
	});
})(window, document);

