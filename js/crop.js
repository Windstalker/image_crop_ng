(function (win, doc) {
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
			x0: 0, y0: 0,
			x1: 0, y1: 0
		};
	});

	app.directive('autocrop', function () {
		return {
			restrict: 'E',
			replace: true,
			scope: true,
			templateUrl: 'templates/autocrop.html',
			controller: function ($scope) {
				$scope.prop = 'property';
				$scope.meth = function () {
					console.log(this.prop);
				}
			}
		};
	});

	app.directive('bbPoint', function () {
		return {
			restrict: 'A',
			require: '^autocrop',
			scope: true,
			link: function (scope, element, attrs, autocropCtrl) {
				element.bind('click', function () {
					console.log('onclick');
					scope.meth();
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

