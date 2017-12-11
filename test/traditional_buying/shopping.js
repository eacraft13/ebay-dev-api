(function () {
    'use strict';

    var ids, shopping;

    ids = [
        '162528379431',
        '332187320796',
        '332029273881'
    ];

    shopping = require('../../lib/traditional_buying/shopping')({
        appId: 'EricCraf-Finder-PRD-b51ca6568-b6fbb7d2',
    });

    shopping.getMultipleItems(ids)
    .then(function (result) {
        console.log(Object.keys(result[0]));
        process.exit();
    })
    .catch(function (err) {
        console.log(err);
        process.exit(1);
    });
})();
