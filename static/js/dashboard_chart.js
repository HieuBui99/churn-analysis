document.addEventListener('DOMContentLoaded', function(){

    var ctx = document.getElementById("churn-rate-chart");
    var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ["Non-churn", "Churn"],
            datasets: [{
                data: [count[0], count[1]],
                backgroundColor: ['#1cc88a', '#e74a3b'],
                hoverBackgroundColor: ['#19b47b', '#d64537'],
                hoverBorderColor: "rgba(234, 236, 244, 1)",
            }],
        },
        options: {
            maintainAspectRatio: false,
            tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                titleFontColor:  "#858796",
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                caretPadding: 10,
                callbacks: {
                    title: function(toolTipItem, chart){
                        return chart['labels'][toolTipItem[0]['index']];
                    },
                    label: function(toolTipItem, chart){
                        var datasets = chart['datasets'][0]
                        var pct = ((datasets['data'][toolTipItem['index']] / (count[0]+count[1])) * 100).toFixed(2) 
                        return datasets['data'][toolTipItem['index']]  + ` (${pct}%)` ;
                    }
                }
            },
            legend: {
                position: 'bottom',
                padding: 15
            }
        },
    });

    var churnLabels = []
    var nonChurnLabels = []
    var churnCount = []
    var nonChurnCount = []
    for (let k in callCount[0]) {
        nonChurnLabels.push(k);
        nonChurnCount.push(callCount[0][k]);
    }
    for (let k in callCount[1]) {
        churnLabels.push(k);
        churnCount.push(callCount[1][k]);
    }
    if (churnLabels.length < nonChurnLabels.length){
        var label = nonChurnLabels;
    } else{
        var label = churnLabels;
    }
    ctx = document.getElementById('call-count-chart').getContext('2d');
    var callChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: label,
            datasets: [
                {
                    label: 'Non-churner',
                    data: nonChurnCount,
                    backgroundColor: '#4e73df',
                    hoverBackgroundColor:'#4e73df',
                    borderColor: '#4e73df',
                    borderWidth: 1,
                    categoryPercentage: 0.7 
                },
                {
                    label: 'Churner',
                    data: churnCount,
                    backgroundColor: '#ffbb00',
                    hoverBackgroundColor:'#e6a902',
                    borderColor: '#ffbb00',
                    borderWidth: 1,
                    categoryPercentage: 0.7 
                }

            ]
        },
        options: {
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Customer service calls',
                        fontFamily: 'Arial'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Count',
                        fontFamily: 'Arial'
                    }
                }]
            }

        }
    })


    ctx = document.getElementById('intl-count-chart').getContext('2d');
    var callChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['No', 'Yes'],
            datasets: [
                {
                    label: 'Non-churner',
                    data: [intlCount[0]['No'], intlCount[0]['Yes']],
                    backgroundColor: '#4e73df',
                    hoverBackgroundColor:'#4e73df',
                    borderColor: '#4e73df',
                    borderWidth: 1,
                    categoryPercentage: 0.6 
                },
                {
                    label: 'Churner',
                    data: [intlCount[1]['No'], intlCount[1]['Yes']],
                    backgroundColor: '#ffbb00',
                    hoverBackgroundColor:'#e6a902',
                    borderColor: '#ffbb00',
                    borderWidth: 1,
                    categoryPercentage: 0.6 
                }

            ]
        },
        options: {
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'International plan',
                        fontFamily: 'Arial'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Count',
                        fontFamily: 'Arial'
                    }
                }]
            }

        }
    })
})
