module.exports = function (credentials) {
    'use strict';

    return {
        finding: require('./lib/searching/finding')(credentials),
        shopping: require('./lib/traditional_buying/shopping')(credentials)
    };
};
