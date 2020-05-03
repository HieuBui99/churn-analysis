document.addEventListener('DOMContentLoaded', function(){
     Chart.pluginService.register({
        beforeDraw: function(chart) {
            if (chart.config.options.elements.center) {
            // Get ctx from string
            var ctx = chart.chart.ctx;

            // Get options from the center object in options
            var centerConfig = chart.config.options.elements.center;
            var fontStyle = centerConfig.fontStyle || 'Arial';
            var txt = centerConfig.text;
            var color = centerConfig.color || '#000';
            var maxFontSize = centerConfig.maxFontSize || 50;
            var sidePadding = centerConfig.sidePadding || 20;
            var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
            // Start with a base font of 30px
            ctx.font = "30px " + fontStyle;

            // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
            var stringWidth = ctx.measureText(txt).width;
            var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

            // Find out how much the font can grow in width.
            var widthRatio = elementWidth / stringWidth;
            var newFontSize = Math.floor(30 * widthRatio);
            var elementHeight = (chart.innerRadius * 2);

            // Pick a new font size so it will not be larger than the height of label.
            var fontSizeToUse = Math.min(newFontSize, elementHeight, maxFontSize);
            var minFontSize = centerConfig.minFontSize;
            var lineHeight = centerConfig.lineHeight || 25;
            var wrapText = false;

            if (minFontSize === undefined) {
                minFontSize = 20;
            }

            if (minFontSize && fontSizeToUse < minFontSize) {
                fontSizeToUse = minFontSize;
                wrapText = true;
            }

            // Set font settings to draw it correctly.
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
            var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
            ctx.font = fontSizeToUse + "px " + fontStyle;
            ctx.fillStyle = color;

            if (!wrapText) {
                ctx.fillText(txt, centerX, centerY);
                return;
            }

            var words = txt.split(' ');
            var line = '';
            var lines = [];

            // Break words up into multiple lines if necessary
            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + ' ';
                var metrics = ctx.measureText(testLine);
                var testWidth = metrics.width;
                if (testWidth > elementWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
                } else {
                line = testLine;
                }
            }

            // Move the center up depending on line height and number of lines
            centerY -= (lines.length / 2) * lineHeight;

            for (var n = 0; n < lines.length; n++) {
                ctx.fillText(lines[n], centerX, centerY);
                centerY += lineHeight;
            }
            //Draw text in center
            ctx.fillText(line, centerX, centerY);
            }
        }
    });


    if (churn_pct >= 0.5){
        var color = '#e74a3b';
        var hoverColor = '#ca4134'
    } else {
        var color = '#1cc88a';
        var hoverColor = '#1cb87f'
    }
    var ctx = document.getElementById('churn-prob').getContext('2d');
    var churnProb = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [churn_pct, 1 - churn_pct],
                backgroundColor: [
                    color,
                    'rgba(201, 201, 201, 0.753)  '
                ],
                hoverBackgroundColor : [
                    hoverColor, 
                    'rgba(189, 188, 188, 0.753)'
                ],
                borderColor: [
                    color,
                    'rgba(201, 201, 201, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            elements: {
                center: {
                text: churn_pct * 100 + '%',
                color: '#000000', 
                fontStyle: 'Arial', 
                sidePadding: 30, 
                minFontSize: 10, 
                lineHeight: 25 
                }
            },
            tooltips: {
                enabled: false
            },
            responsive: true,
            maintainAspectRatio: false,
            cutoutPercentage: 60,
            backgroundColor: "rgb(255,255,255)",
            rotation: - 0.5 * Math.PI
        }   
    });


    ctx = document.getElementById('charge-chart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Day Charge', 'Eve Charge', 'Night Charge', 'International Charge'],
            datasets: [{
                label: 'Total charge',
                data: [totalDayCharge, totalEveCharge, totalNightCharge, totalInternationalCharge],
                backgroundColor: '#4e73df',
                hoverBackgroundColor:'#4e73df',
                borderColor: '#4e73df',
                borderWidth: 1,
                categoryPercentage: 0.5 
            }]
        },
        options: {
            legend: {
                display: false
            },

            tooltips: {
                displayColors: false,
                callbacks: {
                    label: function(toolTipItem, chart){
                    var datasetLabel = chart.datasets[toolTipItem.datasetIndex].label || '';
                    return  'Total ' + toolTipItem.xLabel + ': $' + toolTipItem.yLabel;
                    }
                }
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    ticks: {
                        suggestedMax: 60,
                        maxTicksLimit: 10          
                    }
                }]
            }

        }
    })

    ctx = document.getElementById('contrib-chart').getContext('2d');
    var contribChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: [
                'Total day charge',
                'International plan',
                'Total evening charge',
                'Customer service calls',
                'Total international calls',
                'Voice mail messages',
                'Many service call',
                'Total international charge',
                'Total night charge'
            ],
			datasets: [{
				label: 'Dataset 1',
				backgroundColor: '#4e73df',
				borderColor: '#4e73df',
                hoverBackgroundColor:'#4e73df',
				borderWidth: 1,
				data: [
					contrib.total_day_charge,
                    contrib.international_plan,
                    contrib.total_eve_charge,
                    contrib.customer_service_calls,
                    contrib.total_intl_calls,
                    contrib.number_vmail_messages,
                    contrib.many_service_call,
                    contrib.total_intl_charge,
                    contrib.total_night_charge
				]
			}]
        },
        options: {
            responsive: true,
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    ticks: {
                        suggestedMin: -0.1,
                        suggestedMax: 0.5
                    }
                }],
                yAxes: [{
                    gridLines: {
                        display: false
                    }
                }],
                
            }
        }
    });
})