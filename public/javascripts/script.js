const loadImage = (event) => {
    document.getElementById('viewImage').src = URL.createObjectURL(event.target.files[0]);
}

$("#my-file-selector").change(function () {
    readURL(this);
});

$(document).ready(function () {
    $('.toast').toast('show');
});

$(document).ready(function () {
    $("#edit-personal-info").click(function () {
        $("#input-personal-info").removeAttr("readonly");
        $("#save-personal-info").removeAttr("hidden");
        $("#edit-personal-info").attr("hidden","true");
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
        $("#edit-email").attr("hidden","true");
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
        $("#edit-mobile").attr("hidden","true");
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
    $("#personal-info-toggle").click(function () {
        $("#manage-addresses").attr("hidden", "true");
        $("#personal-info").removeAttr("hidden");
    });
    $("#manage-addresses-toggle").click(function () {
        $("#personal-info").attr("hidden", "true");
        $("#manage-addresses").removeAttr("hidden");
    });
})