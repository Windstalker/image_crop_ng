(function (win, doc) {
	var app = angular.module('ImgCropApp', []);
	var mainCtrl = app.controller('AppCtrl', function ($scope) {
		$scope.imgWidth = 640;
		$scope.imgHeight = 480;
		$scope.imgSrc = "http://lorempixel.com";
		$scope.imgTheme = "nature";

		$scope.coords = {
			x0: 0, y0: 0,
			x1: 0, y1: 0
		};

		$scope.getImgSrc = function () {
			var parts = [
				this.imgSrc,
				this.imgWidth,
				this.imgHeight,
				this.imgTheme
			];

			return parts.join('/')
		}
	});
})(window, document);

