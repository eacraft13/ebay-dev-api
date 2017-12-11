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

    var defaults;

    defaults = {
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
    };

    return {
        /**
         * Find items by store name
         * @param {object} options - represents the request body from eBay api documentation
         * @param {string} options.storeName
         * @param {number} [options.paginationInput.pageNumber = 1]
         * @returns {Promise}
         */
        findItemsIneBayStores: function (options) {
            return new Promise(function (resolve, reject) {
                if (!options.storeName)
                    return reject('A store name must be provided.');

                _.defaults(options, { paginationInput: { pageNumber: 1 } });

                request({
                    uri: config.endpoint,
                    qs: _.assign(
                        {},
                        config.params,
                        {
                            'OPERATION-NAME': 'findItemsIneBayStores',
                            'SECURITY-APPNAME': credentials.appId,
                            outputSelector: 'AspectHistogram,SellerInfo,StoreInfo',
                            storeName: options.storeName,
                            'paginationInput.pageNumber': options.paginationInput.pageNumber
                        },
                        prepareFilters(defaults.itemFilter)
                    )
                }, function (err, res, body) {
                    var data;

                    if (err)
                        return reject(err);

                    try {
                        data = JSON.parse(body).findItemsIneBayStoresResponse[0];

                        if (!_.includes(data.ack, 'Success'))
                            return reject(data.ack + ': ' + data.errorMessage);
                    } catch (e) {
                        return reject('Error parsing response ' + '(' + body + ').');
                    }

                    data.searchResult['@total'] = data.paginationOutput[0].totalEntries[0];

                    return resolve(data.searchResult);
                });
            });
        }
    };

    /**
     * Prepares filters as url parameters
     * @param {object} filters
     * @return {object}
     */
    function prepareFilters(filters) {
        var prepared = {};

        _.each(filters, function (filter, i) {
            _.each(filter, function (val, key) {
                prepared['itemFilter(' + i + ').' + key] = val;
            });
        });

        return prepared;
    }
};


