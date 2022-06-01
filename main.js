var initialData, chart;
const startYear = 90,
  endYear = 110,
  btn = document.getElementById('play-pause-button'),
  input = document.getElementById('play-range'),
  nbr = 20;

/**
 * Calculate the data output
 */

function getData(year) {
  return Object.entries(initialData[year]).sort((a, b) => b[1] - a[1]).slice(0, nbr)
}

Highcharts.getJSON('./result.json', function (data) {
  initialData = data;

  chart = Highcharts.chart('container', {
    chart: {
      animation: {
        duration: 1500
      },
      events: {
        render() {
          let chart = this;

          // Responsive input
          input.style.width = chart.plotWidth - chart.legend.legendWidth + chart.plotLeft / 2 - 10 + 'px' // where 10 is a padding
        }
      },
      marginRight: 50,
    },
    plotOptions: {
      series: {
        animation: false,
        groupPadding: 0,
        pointPadding: 0.1,
        borderWidth: 0
      }
    },
    title: {
      useHTML: true,
      text: `退選人數總計`
    },

    legend: {
      align: 'right',
      verticalAlign: 'bottom',
      itemStyle: {
        fontWeight: 'bold',
        fontSize: '50px',
      },
      symbolHeight: 0.001,
      symbolWidth: 0.001,
      symbolRadius: 0.001,
    },
    xAxis: {
      type: 'category',
    },
    yAxis: [{
      opposite: true,
      title: {
        text: '總退選人數'
      },
      tickAmount: 5
    }],
    series: [{
      colorByPoint: true,
      dataSorting: {
        enabled: true,
        matchByName: true
      },
      type: 'bar',
      dataLabels: [{
        enabled: true,
      }],
      name: startYear,
      data: getData(startYear)
    }]
  });
});

/**
 * Update the chart. This happens either on updating (moving) the range input,
 * or from a timer when the timeline is playing.
 */
function update(increment) {
  if (increment) {
    input.value = parseInt(input.value) + increment;
  }
  if (input.value >= endYear) { // Auto-pause
    pause(btn);
  }

  chart.update({
    title: {
      useHTML: true,
      text: `退選人數總計`
    },
  }, false, false, false)

  chart.series[0].update({
    name: input.value,
    data: getData(input.value)
  })
}

let timer;
/**
 * Play the timeline.
 */
function play(button) {
  button.title = 'pause';
  button.className = 'fa fa-pause';
  timer = setInterval(() => update(1), 2000);
}

/**
 * Pause the timeline, either when the range is ended, or when clicking the pause button.
 * Pausing stops the timer and resets the button to play mode.
 */
function pause(button) {
  button.title = 'play';
  button.className = 'fa fa-play';
  clearTimeout(timer);
}


btn.addEventListener('click', function () {
  if (chart.sequenceTimer) {
    pause(this)
  } else {
    play(this)
  }
})
/**
 * Trigger the update on the range bar click.
 */
input.addEventListener('click', function () {
  update()
})