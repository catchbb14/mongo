
$(document).ready(function() {
    //Save Event

    $(document).on("click", ".saveEvent", function(event) {

        event.preventDefault();
    
        var id = $(this).data('id');
        $(this).remove();
        $.ajax({
            method: "PUT",
            url: "/articles/" + id,
            data: { saved: true }
        }).done(function(res) {
            console.log(res);
        })
    
    });

    $(document).on('click', '.deleteSaved', function() {
        var id = $(this).data('id');
        $.ajax({
            method: "PUT",
            url: "/articles/" + id,
            data: { saved: false }
        }).done(function(res) {
            console.log(res);
            location.reload();
        })
        
    });

    $(document).on('click', '.addComment', function() {
        var id = $(this).data('id');
        var commentText = $(this).parent().parent().parent()
            .children('.input-group').children('input');
        console.log(commentText.val())

        $.ajax({
            method: "POST",
            url: "/articles/" + id,
            data: {
               body: commentText.val()
            }
        }).done(function(res) {
            console.log(res);
            commentText.val("")
            location.reload();
        })
    })

    // ["0"].parentElement.parentElement.parentElement.children[2]
})

    