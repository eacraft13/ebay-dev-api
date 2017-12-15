'use strict';

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
         * @param {boolean} [applyDefaultFilters = true]
         * @returns {Promise}
         */
        findItemsIneBayStores: function (options, applyDefaultFilters) {
            return new Promise(function (resolve, reject) {
                var filters = {};

                if (!options.storeName)
                    return reject(new Error('A store name must be provided.'));

                _.defaults(options, { paginationInput: { pageNumber: 1 } });

                if (applyDefaultFilters)
                    filters = prepareFilters(defaults.itemFilter);

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
                        filters
                    )
                }, function (err, res, body) {
                    var data;

                    if (err)
                        return reject(new Error(err));

                    try {
                        data = JSON.parse(body).findItemsIneBayStoresResponse[0];

                        if (!_.includes(data.ack, 'Success'))
                            return reject(new Error(data.errorMessage));
                    } catch (e) {
                        return reject(new Error('Error parsing response ' + '(' + body + ').'));
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


