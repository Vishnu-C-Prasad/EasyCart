var db = require('../config/connection');
var collection = require('../config/collection');
var bcrypt = require('bcrypt');
var ObjectID = require('mongodb').ObjectID;

module.exports = {
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email });
            if (admin) {
                bcrypt.compare(adminData.password, admin.password).then((status) => {
                    if (status) {
                        console.log('Login success');
                        response.admin = admin;
                        response.status = true;
                        resolve(response);
                    } else {
                        console.log('Login Failed');
                        resolve({ status: false });
                    }
                });
            } else {
                console.log('Cannot find admin');
                resolve({ status: false });
            }
        });
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            const orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        let: { productList: '$products.item' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', '$$productList']
                                    }
                                }
                            }
                        ],
                        as: 'productDetails'
                    }
                }
            ]).toArray();
            resolve(orders);
        });
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            const users = await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(users);
        });
    }
}