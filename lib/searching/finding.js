/**
 * Finding api
 * @param {object} credentials
 * @returns {object}
 */
module.exports = function (credentials) {
    'use strict';

    var _ = require('lodash');
    var config = require('./config');
    var defaults = require('./defaults');
    var finding = {};
    var request = require('request');

    /**
     * Find items by store name
     *
     * Sample:
     * options = {
     *     itemFilter: [
     *         {
     *             name: 'Seller',
     *             value: 'xyz'
     *         },
     *         {
     *             name: 'Seller',
     *             value: 'abc'
     *         },
     *     ],
     *     storeName: 'A B C'
     * };
     * @param {object} options - represents the 'call specific fields' from eBay api documentation
     * @returns {Promise}
     */
    finding.findItemsIneBayStores = function (options) {
        return new Promise(function (resolve, reject) {
            var callSpecificFields, headers, standardInputFields;

            if (!options)
                reject('The parameter \'options\' is required.');

            if (!_.has(options, 'itemFilter.storeName') && _.some(options, { itemFilter: { name: 'Seller' }}))
                reject('A store name or seller must be provided.');

            callSpecificFields = _.assign({}, defaults, options);
            headers = _.assign({}, config.headers, {
                'X-EBAY-SOA-OPERATION-NAME': 'findItemsIneBayStores',
                'X-EBAY-SOA-SECURITY-APPNAME': credentials.appId
            });
            standardInputFields = _.assign({}, config.standardInputFields, options.standardInputFields);

            request({
                body: _.assign({}, standardInputFields, callSpecificFields),
                headers: headers,
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
