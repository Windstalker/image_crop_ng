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

	var imgEditor = app.controller('ImgEditorCtrl', function ($scope, ImgData, BoundBoxData) {
		$scope.imgData = ImgData;
		$scope.bbox = BoundBoxData;

		$scope.getImgSrc = function () {
			var parts = [
				this.imgData.src,
				this.imgData.width,
				this.imgData.height,
				this.imgData.theme
			];

			return parts.join('/')
		}
	});
	var imgLoader = app.controller('ImgLoaderCtrl', function ($scope, ImgData) {
		$scope.model = ImgData;
	});
	var boundBoxCoords = app.controller('BoundBoxCtrl', function ($scope, BoundBoxData) {
		$scope.bbox = BoundBoxData;
	});
})(window, document);

