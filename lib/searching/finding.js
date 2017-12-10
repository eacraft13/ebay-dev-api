/**
 * Finding api
 * @param {object} credentials
 * @returns {object}
 */
module.exports = function (credentials) {
    'use strict';

    var _ = require('lodash');
    var config = require('./config');
    var finding = {};
    var request = require('request');

    /**
     * Find items by store name
     * @param {object} options
     * @returns {Promise}
     */
    finding.findItemsIneBayStores = function (options) {
        return new Promise(function (resolve, reject) {
            var callSpecificFields = options;
            var headers = {
                'X-EBAY-SOA-OPERATION-NAME': 'findItemsIneBayStores',
                'X-EBAY-SOA-SECURITY-APPNAME': credentials.appId
            };
            var standardInputFields = {};

            request({
                body: _.assign({}, config.standardInputFields, standardInputFields, callSpecificFields),
                headers: _.assign({}, config.headers, headers),
                json: true,
                method: 'POST',
                uri: config.endpoint,
            }, function (err, res, body) {
                var data;

                if (err)
                    reject(err);

                if (res.statusCode !== 200)
                    reject(res.statusCode + '(' + res.message + ')');

                try {
                    data = JSON.parse(body).findItemsIneBayStoresResponse[0].searchResult;
                } catch (e) {
                    reject('Error parsing response.');
                }

                resolve(data);
            });
        });
    };

    return finding;
};
