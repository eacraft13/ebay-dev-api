var _ = require('lodash');
var config = require('./config');
var moment = require('moment');
var request = require('request');

/**
 * Finding api
 * @param {object} credentials
 * @returns {object}
 */
module.exports = function (credentials) {
    'use strict';

    var defaults, finding;

    finding = {};

    defaults = {
        headers: {
            'X-EBAY-SOA-SECURITY-APPNAME': credentials.appId
        },
        findItemsIneBayStoresRequest: {
            itemFilter: [
                {
                    name: 'Condition',
                    value: 'New'
                },
                {
                    name: 'Currency',
                    value: 'USD'
                },
                {
                    name: 'EndTimeFrom',
                    value: moment().add(1, 'd').utc().toISOString()
                },
                {
                    name: 'ListingType',
                    value: 'FixedPrice'
                },
                {
                    name: 'MaxPrice',
                    value: '350.00'
                },
                {
                    name: 'MinPrice',
                    value: '45.00'
                },
            ],
            outputSelector: [
                'AspectHistogram',
                'SellerInfo',
                'StoreInfo'
            ],
            xmlns: 'http://www.ebay.com/marketplace/search/v1/services',
        }
    };

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
     * @param {object} options - represents the request body from eBay api documentation
     * @returns {Promise}
     */
    finding.findItemsIneBayStores = function (options) {
        return new Promise(function (resolve, reject) {
            var headers, payload;

            if (!options)
                return reject('The parameter \'options\' is required.');

            if (!_.has(options, 'itemFilter.storeName') && _.some(options, { itemFilter: { name: 'Seller' }}))
                return reject('A store name or seller must be provided.');

            headers = _.assign({}, config.headers, defaults.headers, { 'X-EBAY-SOA-OPERATION-NAME': 'findItemsIneBayStores', });
            payload = _.assign({}, config.standardInputFields, defaults.findItemsIneBayStoresRequest, options);

            request({
                body: { findItemsIneBayStoresRequest: payload },
                headers: headers,
                json: true,
                method: 'POST',
                uri: config.endpoint,
            }, function (err, res, body) {
                var data;

                if (err)
                    return reject(err);

                if (res.statusCode !== 200)
                    return reject(res.statusCode + ' (' + body + ')');

                try {
                    data = JSON.parse(body).findItemsIneBayStoresResponse[0].searchResult;
                } catch (e) {
                    return reject('Error parsing response.');
                }

                return resolve(data);
            });
        });
    };

    return finding;
};
