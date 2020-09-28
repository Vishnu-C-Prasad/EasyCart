var db = require('../config/connection');
var colleciton = require('../config/collection');

module.exports = {
    addProduct: (product, callback) => {
        db.get().collection(colleciton.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            callback(data.ops[0]._id);
        });
    },
    getProduct: () => {
        return new Promise( async (resolve, reject) => {
            const products = await db.get().collection(colleciton.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        });
    }
}