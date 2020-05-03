$(document).ready(function () {
    var myTable = $('#infoTable').DataTable({
        "paging": true,
        "pagingType": "first_last_numbers",
        "dom": 'ltip',
        "order": [[1, "asc"]],
        "columnDefs": [
            {"orderable": false, "targets": [0, 2, 3, 5]}, 
            {"searchable": false, "targets": [2, 3, 4]}
        ]
    });
    $('.dataTables_length').addClass('bs-select');

    $('#searchBox').on('keyup change', function(){
        myTable.search(this.value).draw();
    })      
});



document.addEventListener('DOMContentLoaded', function() {
    var boxes = document.querySelectorAll('.checkCol');
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].onchange = function (){
            hidden = true;
            for (let j = 0; j < boxes.length; j++) {
                if (boxes[j].checked){
                    hidden = false;
                    break;
                } 
            }
            if (hidden){
                document.querySelector('#delete').style.visibility = "hidden";
                document.querySelector('#deleteAll').style.visibility = "hidden";
            } else{
                document.querySelector('#delete').style.visibility = "visible"
                document.querySelector('#deleteAll').style.visibility = "visible";
            }
        }
    }
    
}
);

