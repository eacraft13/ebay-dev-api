'use strict';

(function () {

    var credentials = { appId: 'Your-App-Id' },
        ebay = require('ebay-dev-api')(credentials);

    /**
     * Example of using the shopping api
     */
    ebay.shopping
    .getMultipleItems([
        '162528379431',
        '332187320796',
        '332029273881'
    ])
    .then(function (result) {
        console.log(result);
        process.exit();
    })
    .catch(function (err) {
        console.log(err);
        process.exit(1);
    });


    /**
     * Example of using the finding api
     */
    ebay.finding
    .findItemsIneBayStores({
        storeName: 'Top USA Offers'
    })
    .then(function (result) {
        console.log(result);
        process.exit();
    })
    .catch(function (err) {
        console.log(err);
        process.exit(1);
    });
}());
