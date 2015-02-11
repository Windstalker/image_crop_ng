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
			src: "http://lorempixel.com",
			theme: "nature"
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
							$scope.bbox.width = w;
							$scope.bbox.y = y;
							$scope.bbox.height = h;
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
			scope: true,
			link: function (scope, element) {
				element.bind('mousedown', function (e) {
					scope.onBBPointDragStart(this, e);
				});
			}
		}
	});

	app.controller('ImgEditorCtrl', function ($scope, ImgData, BoundBoxData) {
		$scope.imgData = ImgData;
		$scope.bbox = BoundBoxData;

		$scope.getImgSrc = function (imgData) {
			var parts = [
				imgData.src,
				imgData.width,
				imgData.height,
				imgData.theme
			];

			return parts.join('/')
		}
	});

	app.controller('ImgLoaderCtrl', function ($scope, ImgData) {
		$scope.model = ImgData;
	});

	app.controller('BoundBoxCtrl', function ($scope, BoundBoxData) {
		$scope.bbox = BoundBoxData;
	});
})(window, document);

