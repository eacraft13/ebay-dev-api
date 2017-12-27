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
    var finding = {};

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

    /**
     * Find items by store name
     *
     * eBay api payload
     * {
     *     "itemId":["292365480201"],
     *     "title":["New Oversize Embroidered Western Texas Lone Star Bedding Comforter Set."],
     *     "globalId":["EBAY-US"],
     *     "primaryCategory":[{
     *         "categoryId":["45462"],
     *         "categoryName":["Comforters & Sets"]
     *     }],
     *     "galleryURL":["http://thumbs2.ebaystatic.com/pict/292365480201404000000001_1.jpg"],
     *     "viewItemURL":["http://www.ebay.com/itm/New-Oversize-Embroidered-Western-Texas-Lone-Star-Bedding-Comforter-Set-/292365480201?var=591249780274"],
     *     "paymentMethod":["PayPal"],
     *     "autoPay":["true"],
     *     "postalCode":["52338"],
     *     "location":["Swisher,IA,USA"],
     *     "country":["US"],
     *     "shippingInfo":[{
     *         "shippingServiceCost":[{
     *             "@currencyId":"USD",
     *             "__value__":"0.0"
     *         }],
     *         "shippingType":["Free"],
     *         "shipToLocations":["Worldwide"],
     *         "expeditedShipping":["true"],
     *         "oneDayShippingAvailable":["false"],
     *         "handlingTime":["3"]
     *     }],
     *     "sellingStatus":[{
     *         "currentPrice":[{
     *             "@currencyId":"USD",
     *             "__value__":"166.37"
     *         }],
     *         "convertedCurrentPrice":[{
     *             "@currencyId":"USD",
     *             "__value__":"166.37"
     *         }],
     *         "sellingState":["Active"],
     *         "timeLeft":["P18DT16H59M7S"]
     *     }],
     *     "listingInfo":[{
     *         "bestOfferEnabled":["false"],
     *         "buyItNowAvailable":["false"],
     *         "startTime":["2017-12-10T13:17:35.000Z"],
     *         "endTime":["2018-01-09T13:17:35.000Z"],
     *         "listingType":["FixedPrice"],
     *         "gift":["false"],
     *         "watchCount":["1"]
     *     }],
     *     "returnsAccepted":["true"],
     *     "condition":[{
     *         "conditionId":["1000"],
     *         "conditionDisplayName":["New with tags"]
     *     }],
     *     "isMultiVariationListing":["true"],
     *     "topRatedListing":["false"]
     * }
     *
     * @param {object} options - represents the request body from eBay api documentation
     * @param {string} options.storeName
     * @param {array} [options.outputSelector = []]
     * @param {object} [options.filters = {}]
     * @param {number} [options.page = 1]
     * @returns {Promise}
     */
    finding.findItemsIneBayStores = function (options) {
        return new Promise(function (resolve, reject) {
            if (!options.storeName)
                return reject(new Error('A store name must be provided.'));

            _.defaults(options, {
                outputSelector: [],
                filters: {},
                page: 1
            });

            request({
                uri: config.endpoint,
                qs: _.assign(
                    {},
                    config.params,
                    {
                        'OPERATION-NAME': 'findItemsIneBayStores',
                        'SECURITY-APPNAME': credentials.appId,
                        outputSelector: options.outputSelector.join(','),
                        storeName: options.storeName,
                        'paginationInput.pageNumber': options.page
                    },
                    prepareFilters(options.filters)
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
    };

    return finding;

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


