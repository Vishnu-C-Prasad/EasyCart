const loadImage = (event) => {
    document.getElementById('viewImage').src = URL.createObjectURL(event.target.files[0]);
}

$("#my-file-selector").change(function () {
    readURL(this);
});

$(document).ready(function () {
    $('.toast').toast('show');
});