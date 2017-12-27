'use strict';

var _ = require('lodash');
var config = require('./config');
var request = require('request');

/**
 * Shopping api
 * @param {object} credentials
 * @returns {object}
 */
module.exports = function (credentials) {
    var shopping = {};

    /**
     * Get multiple items by ids
     * @param {array} ids
     * @returns {Promise}
     */
    shopping.getMultipleItems = function (ids) {
        var funcs;

        if (!ids)
            return Promise.reject('A list of ids must be provided.');

        if (!Array.isArray(ids))
            ids = [ids];

        funcs = _.map(
            new Array(Math.ceil(ids.length / 20)),
            function (val, i) {
                return new Promise(function (resolve, reject) {
                    var start = i * 20;

                    request({
                        uri: config.uri,
                        qs: _.assign(
                            {},
                            config.params,
                            {
                                callname: 'GetMultipleItems',
                                appid: credentials.appId,
                                IncludeSelector: 'Details,Description,ItemSpecifics,ShippingCosts,Variations',
                                ItemID: ids.slice(start, start + 20).join(',')
                            }
                        )
                    }, function (err, res, body) {
                        var data;

                        if (err)
                            return reject(err);

                        try {
                            data = JSON.parse(body);

                            if (!_.includes(data.Ack, 'Success'))
                                return reject(data.Ack[0] + ': ' + data.errorMessage);
                        } catch (e) {
                            return reject('Error parsing response ' + '(' + body + ').');
                        }

                        return resolve(data.Item);
                    });
                });
            }
        );

        return Promise
            .all(funcs)
            .then(function (items) {
                return _.flatten(items);
            });
    };

    /**
     * Explodes an item into multiple items for each of its variations
     * @param {object} item
     * @returns {array}
     */
    shopping.explodeVariations = function (item) {
        var variations = [];

        if (item.Variations) {
            _.each(item.Variations.Variation, function (variationSpecs) {
                var variation;

                variation = _.assign({}, item, {
                    Variations: {
                        Variation: variationSpecs
                    }
                });

                variations.push(variation);
            });
        } else {
            variations.push(item);
        }

        return variations;
    };

    shopping.getVariation = function (item, variationSpecs) {
        var exists;
        var variation = item;

        if (item.Variations) {
            exists = _.find(item.Variations.Variation, function (specs) {
                return _.isEqual(specs, variationSpecs);
            });

            if (exists)
                variation.Variations.Variation = variationSpecs;
            else
                variation.Variations.Variation = null;
        }

        return variation;
    };

    return shopping;
};
