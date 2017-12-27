'use strict';

module.exports = function (credentials) {
    return {
        finding: require('./lib/searching/finding')(credentials),
        shopping: require('./lib/traditional_buying/shopping')(credentials),
        storeName: credentials.storeName
    };
};
