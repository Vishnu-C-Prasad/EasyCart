function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#my-file-selector-image').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

$("#my-file-selector").change(function () {
    readURL(this);
});

$(document).ready(function () {
    $('.toast').toast('show');
});