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

	app.factory('BoundBoxData', function () {
		return {
			x: 150, y: 150,
			width: 320, height: 240
		};
	});

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

	app.directive('imgCanvas', function ($document) {
		return {
			restrict: 'A',
			controller: function ($scope, $element) {
				console.log($element);
				$scope.cnv = $element.get(0);
				$scope.ctx = $scope.cnv.getContext('2d');
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
					$scope.ctx.save();
					$scope.ctx.globalCompositeOperation = "destination-over";
					this.ctx.drawImage(this.imgEl, 0, 0, this.cnv.width, this.cnv.height);
					$scope.ctx.restore();
				};
				$scope.drawCropArea = function () {
					var coords = this.getCropAreaCoords();
					this.ctx.save();
					this.ctx.globalAlpha = 0.6;
					this.ctx.fillStyle = '#33bb33';
					this.ctx.fillRect(0, 0, this.cnv.width, this.cnv.height);
					this.ctx.clearRect.apply(this.ctx, coords);
					this.ctx.restore();
				};
				$scope.extractCropImg = function () {
					var dataURI;
				};
				$scope.getCropAreaCoords = function () {
					var offset = $element.offset(),
						offsetX = offset.left,
						offsetY = offset.top;
					return [this.bbox.x - offsetX, this.bbox.y - offsetY, this.bbox.width, this.bbox.height];
				}
			},
			link: function (scope, element) {
				scope.$watchCollection('imgData', function (newData) {
					console.log('img changes!');
					$.extend(scope.imgEl, newData);
				});
				scope.$watchCollection('bbox', function (newData) {
					scope.drawCycle();
				});
			}
		}
	});

	app.controller('ImgEditorCtrl', function ($scope, ImgData, BoundBoxData) {
		$scope.imgData = ImgData;
		$scope.bbox = BoundBoxData;
	});

	app.controller('ImgLoaderCtrl', function ($scope, ImgData) {
		$scope.imgData = ImgData;
	});

	app.controller('BoundBoxCtrl', function ($scope, BoundBoxData) {
		$scope.bbox = BoundBoxData;
	});
})(window, document);

