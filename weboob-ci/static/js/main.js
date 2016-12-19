'use strict';

(function () {
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }

    if (!String.prototype.capitalize) {
        String.prototype.capitalize = function () {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }
    }

    if (window.location.pathname.startsWith('/module/')) {
        moduleView(window.location.pathname.replace('/module/', ''))
    } else {
        indexView()
    }
})();
