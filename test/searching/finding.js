(function () {
    'use strict';

    var finding = require('../../lib/searching/finding')({
        appId: 'EricCraf-Finder-PRD-b51ca6568-b6fbb7d2',
    });

    finding.findItemsIneBayStores({
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
})();
