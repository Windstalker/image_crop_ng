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
			x: 0, y: 0,
			width: 0, height: 0
		};
	});

	app.directive('autocrop', function () {
		return {
			restrict: 'E',
			replace: true,
			scope: true,
			templateUrl: 'templates/autocrop.html',
			controller: function ($scope, $document, BoundBoxData) {
				console.log($document);
				$scope.activePoint = null;
				$scope.activePointOffset = null;
				$scope.startCoord = {x: 0, y: 0};
				$scope.lastCoord = {x: 0, y: 0};
				$scope.bbox = BoundBoxData;

				$scope.onBBPointDragStart = function (el, event) {
					console.log('drag start');
					var x = event.screenX,
						y = event.screenY;
					$scope.activePoint = el;
					$scope.activePointOffset = el
						.getAttribute('data-offset')
						.split(',')
						.map(function (item) {
							return parseInt(item);
						});
					$scope.startCoord.x = x;
					$scope.startCoord.y = y;

					$scope.lastCoord.x = x;
					$scope.lastCoord.y = y;

					$document.bind('mousemove.bbpoint', function (e) {
						$scope.onBBPointMove(e);
					});
					$document.bind('mouseup.bbpoint', function (e) {
						$scope.onBBPointDragEnd(e);
					});
				};
				$scope.onBBPointMove = function (e) {
					if (!!$scope.activePoint) {
						console.log('drag move');
						$scope.bbox.x += e.screenX - $scope.lastCoord.x;
						$scope.bbox.y += e.screenY - $scope.lastCoord.y;
						$scope.lastCoord.x = e.screenX;
						$scope.lastCoord.y = e.screenY;
						console.log($scope.bbox);
					}
				};
				$scope.onBBPointDragEnd = function (e) {
					if (!!$scope.activePoint) {
						$scope.activePoint = null;
						$scope.activePointOffset = null;
						console.log('drag end');
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

