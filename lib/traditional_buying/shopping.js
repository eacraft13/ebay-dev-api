var _ = require('lodash');
var config = require('./config');
var request = require('request');

/**
 * eBay shopping api module
 * @param {object} credentials
 */
module.exports = function (credentials) {
    'use strict';

    return {
        /**
         * Get multiple items by ids
         * @param {array} ids
         * @returns {Promise}
         */
        getMultipleItems: function (ids) {
            var funcs = _.map(
                new Array(Math.ceil(ids.length / 20)),
                function (val, i) {
                    return new Promise(function (resolve, reject) {
                        var start = i * 20;

                        request({
                            url: config.uri,
                            qs: _.assign(
                                {},
                                config.params,
                                {
                                    callname: 'GetMultipleItems',
                                    appid: credentials.appId,
                                    // IncludeSelector: 'Details,TextDescription,ItemSpecifics,Variations',
                                    IncludeSelector: 'Details,TextDescription,ItemSpecifics',
                                    ItemID: ids.slice(start, start + 20).join(',')
                                }
                            )
                        }, function (err, res, body) {
                            var data;

                            if (err)
                                reject(err);

                            data = JSON.parse(body).Item;

                            resolve(data);
                        });
                    });
                }
            );

            return Promise
                .all(funcs)
                .then(function (items) {
                    return _.flatten(items);
                });
        }
    };
};
