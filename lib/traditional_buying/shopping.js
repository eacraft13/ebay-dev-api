'use strict';

var _       = require('lodash');
var config  = require('./config');
var hash    = require('object-hash');
var request = require('request');

/**
 * Shopping api
 * @param {object} credentials
 * @returns {object}
 */
module.exports = function (credentials) {
    var shopping = {};

    /**
     * Create variation specific unique id
     * @param {object} item
     * @returns {string}
     */
    shopping.generateId = function (item) {
        var variationHash;

        if (item.Variations)
            variationHash = hash.MD5(item.Variations.Variation);
        else
            variationHash = 0;

        return `${item.ItemID}-${variationHash}`;
    };

    /**
     * Seperates generated id into its parts
     * @param {string} id
     * @returns {object}
     */
    shopping.explodeId = function (id) {
        var itemId, variation, variationHash;

        itemId = id.split('-')[0];
        variationHash = id.split('-')[1];

        if (variationHash === 0)
            variation = null;
        else
            variation = variationHash;

        return {
            itemId: itemId,
            variationHash: variation
        };
    };

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

    /**
     * Returns variation based on variation hash of id
     * @param {object} item
     */
    shopping.getVariation = function (item, variationHash) {
        var exists;
        var self = this;
        var variations;

        variations = this.explodeVariations(item);

        if (item.Variations) {
            exists = _.find(variations, function (variation) {
                var exploded = self.explodeId(self.generateId(variation));
                return _.isEqual(exploded.variationHash, variationHash);
            });

            if (exists)
                return exists;
        }

        return item;
    };

    return shopping;
};
