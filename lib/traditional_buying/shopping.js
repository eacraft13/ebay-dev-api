var _ = require('lodash');
var config = require('./config');
var request = require('request');

/**
 * Shopping api
 * @param {object} credentials
 * @returns {object}
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
                                    // Details, Description, TextDescription, ItemSpecifics, Variations
                                    IncludeSelector: 'Details,ItemSpecifics',
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
        }
    };
};
