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
    },
    shipOrder: ({ orderId }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({
                _id: ObjectID(orderId)
            }, {
                $set: {
                    status: {
                        pending: false,
                        placed: false,
                        shipped: true,
                        delivered: false,
                        canceled: false
                    }
                }
            }).then((response) => {
                resolve();
            });
        });
    },
    orderDelivered: ({ orderId }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({
                _id: ObjectID(orderId)
            }, {
                $set: {
                    status: {
                        pending: false,
                        placed: false,
                        shipped: false,
                        delivered: true,
                        canceled: false
                    }
                }
            }).then((response) => {
                resolve();
            });
        });
    },
    cancelOrder: ({ orderId }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({
                _id: ObjectID(orderId)
            }, {
                $set: {
                    status: {
                        pending: false,
                        placed: false,
                        shipped: false,
                        delivered: false,
                        canceled: true
                    }
                }
            }).then((response) => {
                resolve();
            });
        });
    },
    removeOrder: ({ orderId }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).removeOne({ _id: ObjectID(orderId) }).then((response) => {
                resolve();
            });
        });
    },
    getOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            const orderDetails = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectID(orderId) });
            const productDetails = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: ObjectID(orderId)
                    }
                }, {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray();
            resolve({ orderDetails, productDetails });
        });
    }
}