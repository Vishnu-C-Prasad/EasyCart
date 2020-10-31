$(document).ready(function () {
    $('#data-table').DataTable();
    setTimeout(() => {
        document.getElementById('manage-alert').setAttribute('hidden', true);
    }, 5000);
});

const loadImage = (event) => {
    document.getElementById('viewImage').src = URL.createObjectURL(event.target.files[0]);
}

const addToCart = (event, productId) => {
    $.ajax({
        url: `/add-to-cart/${productId}`,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = document.getElementById('cart-count').innerHTML;
                count = parseInt(count) + 1;
                document.getElementById('cart-count').innerHTML = count;
                document.getElementById('add-alert-body').innerHTML = 'Successfully added to Cart.';
                document.getElementById('add-alert').removeAttribute('hidden');
                setTimeout(() => {
                    document.getElementById('add-alert').setAttribute('hidden', true);
                }, 5000);
            } else {
                location.replace('/login');
            }
        }
    });
}

const addToWishList = (event, productId) => {
    event.preventDefault();
    $.ajax({
        url: `/add-to-wishlist/${productId}`,
        method: 'get',
        success: (response) => {
            if (response.status) {
                document.getElementById('add-alert-body').innerHTML = 'Successfully added to wishlist.';
                document.getElementById('add-alert').removeAttribute('hidden');
                setTimeout(() => {
                    document.getElementById('add-alert').setAttribute('hidden', true);
                }, 5000);
            } else {
                location.replace('/login');
            }
        }
    });
}

const changeProductQuantity = (event, cartId, productId, count) => {
    let quantity = document.getElementById(productId).value;
    quantity = parseInt(quantity);
    count = parseInt(count);
    $.ajax({
        url: '/change-product-quantity',
        data: {
            cart: cartId,
            product: productId,
            count: count,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                const cartCount = parseInt(document.getElementById('my-cart-count').innerHTML);
                document.getElementById('alert-body').innerHTML = 'Product removed from Cart.';
                document.getElementById('alert').removeAttribute('hidden');
                setTimeout(() => {
                    document.getElementById('alert').setAttribute('hidden', true);
                }, 5000);
                if (cartCount === 1) {
                    location.reload();
                } else {
                    document.getElementById(`div${productId}`).remove();
                    document.getElementById('my-cart-count').innerHTML = parseInt(document.getElementById('my-cart-count').innerHTML) + count;
                    document.getElementById('price-section-count').innerHTML = parseInt(document.getElementById('price-section-count').innerHTML) + count;
                    document.getElementById('total-price').innerHTML = response.totalAmount;
                    document.getElementById('total-amount').innerHTML = response.totalAmount;
                }
            } else {
                document.getElementById(productId).value = quantity + count;
                document.getElementById('my-cart-count').innerHTML = parseInt(document.getElementById('my-cart-count').innerHTML) + count;
                document.getElementById('price-section-count').innerHTML = parseInt(document.getElementById('price-section-count').innerHTML) + count;
                document.getElementById('total-price').innerHTML = response.totalAmount;
                document.getElementById('total-amount').innerHTML = response.totalAmount;
            }
        }
    });
}

const removeFromCart = (event, cartId, productId) => {
    let quantity = parseInt(document.getElementById(productId).value);
    let productPrice = parseInt(document.getElementById(`${productId}-price`).innerHTML);
    event.preventDefault();
    $.ajax({
        url: '/remove-from-cart',
        data: {
            cart: cartId,
            product: productId
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                document.getElementById('alert-body').innerHTML = 'Product removed from Cart.';
                document.getElementById('alert').removeAttribute('hidden');
                setTimeout(() => {
                    document.getElementById('alert').setAttribute('hidden', true);
                }, 5000);
                if (parseInt(document.getElementById('my-cart-count').innerHTML) === quantity) {
                    location.reload();
                } else {
                    console.log(quantity, productPrice, quantity * productPrice);
                    document.getElementById(`div${productId}`).remove();
                    document.getElementById('total-price').innerHTML = parseInt(document.getElementById('total-price').innerHTML) - (productPrice * quantity);
                    document.getElementById('total-amount').innerHTML = parseInt(document.getElementById('total-amount').innerHTML) - (productPrice * quantity);
                    document.getElementById('my-cart-count').innerHTML = parseInt(document.getElementById('my-cart-count').innerHTML) - quantity;
                    document.getElementById('price-section-count').innerHTML = parseInt(document.getElementById('price-section-count').innerHTML) - quantity;
                }
            }
        }
    });
}

const removeFromWishList = (event, productId) => {
    event.preventDefault();
    $.ajax({
        url: `/remove-from-wishlist`,
        data: {
            productId: productId
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                document.getElementById(`div${productId}`).remove();
                document.getElementById('add-alert-body').innerHTML = 'Successfully removed from wishlist.';
                document.getElementById('add-alert').removeAttribute('hidden');
                setTimeout(() => {
                    document.getElementById('add-alert').setAttribute('hidden', true);
                }, 5000);
            }
        }
    });
}


$('#Add-Address-form').submit((e) => {
        e.preventDefault();
        $.ajax({
            url: '/add-new-address',
            data: $('#Add-Address-form').serialize(),
            method: 'post',
            success: (response) => {
                const div = `<h6>${response.name} &nbsp;&nbsp;${response.mobile}</h6> <p class="m-0">${response.address}, ${response.locality}, ${response.landmark}, ${response.city}, ${response.state} - <span class="font-weight-bold">${response.pincode}</span></p>`
                document.getElementById('new-address-content').innerHTML = div;
                document.getElementById('new-address-form').setAttribute("hidden", true);
                document.getElementById('new-address-show').removeAttribute("hidden");
            }
        });
    });

    $('#add-address-checkout').submit((e) => {
        e.preventDefault();
        $.ajax({
            url: '/add-new-address',
            data: $('#add-address-checkout').serialize(),
            method: 'post',
            success: (response) => {
                if (response) {
                    location.reload();
                }
            }
        });
    });

    $('#checkout-form').submit((e) => {
        e.preventDefault();
        $.ajax({
            url: '/place-order',
            data: $('#checkout-form').serialize(),
            method: 'post',
            success: (response) => {
                if (response.codSuccess) {
                    location.href = `/order-success/${response._id}`
                } else {
                    razorpayPayment(response);
                }
            }
        });
    });

    const razorpayPayment = (order) => {
        var options = {
            "key": "rzp_test_TJAQ6gBYztR2QQ", // Enter the Key ID generated from the Dashboard
            "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            "currency": "INR",
            "name": "EasyCart",
            "description": "Secure Payments",
            "image": "https://avatars2.githubusercontent.com/u/64061326?s=460&u=361cb89e920400e33326d1abbdcda9399f15f955&v=4",
            "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
            "handler": function (response) {
                verifyPayment(response, order);
            },
            "prefill": {
                "name": "Vishnu C Prasad",
                "email": "vishnucprasad@example.com",
                "contact": "9999999999"
            },
            "notes": {
                "address": "EasyCart PVT.Ltd"
            },
            "theme": {
                "color": "#007bff"
            }
        };
        var rzp1 = new Razorpay(options);
        rzp1.open();
    }

    const verifyPayment = (payment, order) => {
        console.log(order);
        $.ajax({
            url: 'verify-payment',
            data: {
                payment,
                order
            },
            method: 'post',
            success: (response) => {
                if (response.status) {
                    location.href = `/order-success/${order.receipt}`
                } else {
                    alert(response.errMessage);
                }
            }
        });
    }

    const editPersonalInfo = (formId) => {
        $(`#${formId}`).submit((e) => {
            e.preventDefault();
            $.ajax({
                url: '/edit-personal-info',
                data: $(`#${formId}`).serialize(),
                method: 'post',
                success: (response) => {
                    if (response.status) {
                        document.getElementById('update-success-alert').removeAttribute('hidden');
                        setTimeout(() => {
                            document.getElementById('update-success-alert').setAttribute('hidden', true);
                        }, 5000);
                    }
                }
            });
        });
    }

    $('#change-password-form').submit((e) => {
        e.preventDefault();
        $.ajax({
            url: '/change-password',
            data: $('#change-password-form').serialize(),
            method: 'post',
            success: (response) => {
                if (response.status) {
                    document.getElementById('password-change-alert-body').innerHTML = response.successMessage;
                    document.getElementById('password-change-alert-body').classList.remove("text-danger");
                    document.getElementById('password-change-alert').removeAttribute('hidden');
                    setTimeout(() => {
                        document.getElementById('password-change-alert').setAttribute('hidden', true);
                    }, 5000);
                } else {
                    document.getElementById('password-change-alert-body').innerHTML = response.errMessage;
                    document.getElementById('password-change-alert-body').classList.add("text-danger");
                    document.getElementById('password-change-alert').removeAttribute('hidden');
                    setTimeout(() => {
                        document.getElementById('password-change-alert').setAttribute('hidden', true);
                    }, 5000);
                }
            }
        });
    });

    const deleteAddress = (event, addressId) => {
        event.preventDefault();
        $.ajax({
            url: '/delete-address',
            data: {
                addressId
            },
            method: 'post',
            success: (response) => {
                document.getElementById(`address-${addressId}`).remove();
                document.getElementById('manage-address-alert-body').innerHTML = 'Address deleted';
                document.getElementById('manage-address-alert-body').classList.add("text-danger");
                document.getElementById('manage-address-alert').removeAttribute('hidden');
                setTimeout(() => {
                    document.getElementById('manage-address-alert').setAttribute('hidden', true);
                }, 5000);
            }
        });
    }

    const editAddress = (event, addressId) => {
        $(`#edit-address-form-${addressId}`).submit((e) => {
            e.preventDefault();
            $.ajax({
                url: '/edit-address',
                data: $(`#edit-address-form-${addressId}`).serialize(),
                method: 'post',
                success: (response) => {
                    console.log(response);
                    document.getElementById(`address-${addressId}`).remove();
                    const div = `<h6>${response.name} &nbsp;&nbsp;${response.mobile}</h6> <p class="m-0">${response.address}, ${response.locality}, ${response.landmark}, ${response.city}, ${response.state} - <span class="font-weight-bold">${response.pincode}</span></p>`
                    document.getElementById('new-address-content').innerHTML = div;
                    document.getElementById('new-address-show').removeAttribute("hidden");
                    document.getElementById('manage-address-alert-body').innerHTML = 'Address edited successfully';
                    document.getElementById('manage-address-alert-body').classList.remove("text-danger");
                    document.getElementById('manage-address-alert').removeAttribute('hidden');
                    setTimeout(() => {
                        document.getElementById('manage-address-alert').setAttribute('hidden', true);
                    }, 5000);
                }
            });
        });
    }

    const shipOrder = (event, orderId) => {
        event.preventDefault();
        if (confirm("Are you want to ship this order ?")) {
            $.ajax({
                url: '/admin/ship-order',
                data: { orderId },
                method: 'post',
                success: (response) => {
                    if (response.status) {
                        document.getElementById(`order-status-${orderId}`).innerHTML = 'Order Shipped';
                        document.getElementById(`ship-button-${orderId}`).setAttribute("hidden", true);
                        document.getElementById(`delivered-button-${orderId}`).removeAttribute("hidden");
                        document.getElementById('alert-body').innerHTML = 'Order Shipped';
                        document.getElementById('alert').removeAttribute("hidden");
                        setTimeout(() => {
                            document.getElementById('alert').setAttribute('hidden', true);
                        }, 5000);
                    }
                }
            });
        }
    }

    const orderDelivered = (event, orderId) => {
        event.preventDefault();
        if (confirm("Are you want to make this order as delivered ?")) {
            $.ajax({
                url: '/admin/order-delivered',
                data: { orderId },
                method: 'post',
                success: (response) => {
                    if (response.status) {
                        document.getElementById(`order-status-${orderId}`).innerHTML = 'Order Delivered'
                        document.getElementById(`delivered-button-${orderId}`).setAttribute("hidden", true);
                        document.getElementById(`remove-button-${orderId}`).removeAttribute("hidden");
                        document.getElementById(`cancel-button-${orderId}`).setAttribute("hidden", true);
                        document.getElementById('alert-body').innerHTML = 'Order Delivered';
                        document.getElementById('alert').removeAttribute("hidden");
                        setTimeout(() => {
                            document.getElementById('alert').setAttribute('hidden', true);
                        }, 5000);
                    }
                }
            });
        }
    }

    const cancelOrder = (event, orderId) => {
        event.preventDefault();
        if (confirm("Are you sure you want to cancel this order ?")) {
            $.ajax({
                url: '/admin/cancel-order',
                data: { orderId },
                method: 'post',
                success: (response) => {
                    if (response.status) {
                        document.getElementById(`order-status-${orderId}`).innerHTML = 'Order Canceled'
                        document.getElementById(`cancel-button-${orderId}`).setAttribute("hidden", true);
                        document.getElementById(`remove-button-${orderId}`).removeAttribute("hidden");
                        document.getElementById(`ship-button-${orderId}`).setAttribute("hidden", true);
                        document.getElementById(`delivered-button-${orderId}`).setAttribute("hidden", true);
                        document.getElementById('alert-body').classList.add("text-danger");
                        document.getElementById('alert-body').innerHTML = 'Order Canceled';
                        document.getElementById('alert').removeAttribute("hidden");
                        setTimeout(() => {
                            document.getElementById('alert').setAttribute('hidden', true);
                        }, 5000);
                    }
                }
            });
        }
    }

    const removeOrder = (event, orderId) => {
        event.preventDefault();
        if (confirm("Are you sure you want to remove this order ?")) {
            $.ajax({
                url: '/admin/remove-order',
                data: { orderId },
                method: 'post',
                success: (response) => {
                    if (response.status) {
                        document.getElementById(`order${orderId}`).remove();
                        document.getElementById('alert-body').classList.add("text-danger");
                        document.getElementById('alert-body').innerHTML = 'Order Removed';
                        document.getElementById('alert').removeAttribute("hidden");
                        setTimeout(() => {
                            document.getElementById('alert').setAttribute('hidden', true);
                        }, 5000);
                    }
                }
            });
        }
    }

    $(document).ready(function () {
        $("#edit-personal-info").click(function () {
            $("#input-personal-info").removeAttr("readonly");
            $("#save-personal-info").removeAttr("hidden");
            $("#edit-personal-info").attr("hidden", "true");
            $("#cancel-personal-info").removeAttr("hidden");
        });
        $("#cancel-personal-info").click(function () {
            $("#input-personal-info").attr("readonly", "true");
            $("#save-personal-info").attr("hidden", "true");
            $("#cancel-personal-info").attr("hidden", "true");
            $("#edit-personal-info").removeAttr("hidden");
        });
        $("#edit-email").click(function () {
            $("#input-email").removeAttr("readonly");
            $("#save-email").removeAttr("hidden");
            $("#edit-email").attr("hidden", "true");
            $("#cancel-email").removeAttr("hidden");
        });
        $("#cancel-email").click(function () {
            $("#input-email").attr("readonly", "true");
            $("#save-email").attr("hidden", "true");
            $("#cancel-email").attr("hidden", "true");
            $("#edit-email").removeAttr("hidden");
        });
        $("#edit-mobile").click(function () {
            $("#input-mobile").removeAttr("readonly");
            $("#save-mobile").removeAttr("hidden");
            $("#edit-mobile").attr("hidden", "true");
            $("#cancel-mobile").removeAttr("hidden");
        });
        $("#cancel-mobile").click(function () {
            $("#input-mobile").attr("readonly", "true");
            $("#save-mobile").attr("hidden", "true");
            $("#cancel-mobile").attr("hidden", "true");
            $("#edit-mobile").removeAttr("hidden");
        });
        $("#add-new-address").click(function () {
            $("#new-address-form").removeAttr("hidden");
        });
        $("#cancel-new-address").click(function () {
            $("#new-address-form").attr("hidden", "true");
        });
        $("#wishlist-toggle").click(function () {
            $("#manage-addresses").attr("hidden", "true");
            $("#personal-info").attr("hidden", "true");
            $("#wishlist").removeAttr("hidden");
        });
        $("#personal-info-toggle").click(function () {
            $("#manage-addresses").attr("hidden", "true");
            $("#wishlist").attr("hidden", "true");
            $("#personal-info").removeAttr("hidden");
        });
        $("#manage-addresses-toggle").click(function () {
            $("#personal-info").attr("hidden", "true");
            $("#wishlist").attr("hidden", "true");
            $("#manage-addresses").removeAttr("hidden");
        });
    })