var moment = require('moment');

module.exports = {
    callSpecificFields: {
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
        outputSelector: [
            'AspectHistogram',
            'SellerInfo',
            'StoreInfo'
        ]
    }
};
