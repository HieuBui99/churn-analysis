$(document).ready(function () {
    $('#uploadModal').on('hidden.bs.modal', function (e) {
        document.querySelector('#dataFile').value = '';
        this.querySelector('#dataFile').nextElementSibling.querySelector('span').innerHTML = 'Select a CSV or Excel file';
    })
});


document.addEventListener('DOMContentLoaded', function(){
    document.querySelector('#n-churn').innerHTML = count[1];
    setTimeout(function(){
        document.querySelector('.alert').style.display = 'none';
    }, 3000);

    document.querySelector('#dataFile').onchange = function(){
        var label = this.nextElementSibling.querySelector('span');
        var labelVal = label.innerHTML;
        if (this.value){
            label.innerHTML = this.value.split("\\").pop();
        } else{
            label.innerHTML = labelVal;
        }
    }
    document.querySelector('#uploadForm').onsubmit = function(){
        var fileName = document.querySelector('#dataFile').value;
        if (fileName){
            let extension = fileName.split('.').pop();
            if (extension != 'csv' && extension != 'xlsx'){
                alert('Invalid file type!');
                return false;
            }
        } else{
            alert('Please select a file!');
            return false
        }
    }
});
