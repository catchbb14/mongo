


$(document).on("click", ".saveEvent", function(event) {

    event.preventDefault;

    var id = $(this).attr('data-id');
    $.ajax({
        method: "PUT",
        url: "/articles/" + id,
        data: { saved: true }
    }).done(function(res) {
        console.log(res);
    })

})
    