function Interface(data){

  var that = this
  var dataModel = new DataModel(data);
  var settings = new Settings(dataModel);

  $('#tn').prop("checked", settings.displayDefault.TN)
  $('#tp').prop("checked", settings.displayDefault.TP)
  $('#fn').prop("checked", settings.displayDefault.FN)
  $('#fp').prop("checked", settings.displayDefault.FP)

  var tpSlider = document.getElementById('tp-threshold-slider');
  noUiSlider.create(tpSlider, {
    start: settings.TPThresholdDefault,
    connect: 'lower',
    tooltips: true,
    step: 0.01,
    range: {
      "min": settings.TPMin,
      "max": settings.TPMax
    }
  });

  var tnSlider = document.getElementById('tn-threshold-slider');
  noUiSlider.create(tnSlider, {
    start: 1 - settings.TNThresholdDefault,
    connect: 'lower',
    tooltips: true,
    step: 0.01,
    range: {
      'min': settings.TNMin + 0.5,
      'max': settings.TNMax + 0.5
    }
  });

  var probRangeSlider = document.getElementById('probRange-slider');
  noUiSlider.create(probRangeSlider, {
    orientation: "vertical",
    direction: 'rtl',
    start: [settings.probabilityRange.lowerBound, settings.probabilityRange.upperBound],
    step: 0.1,
    behavior: 'drag',
    connect: true,
    tooltips: [ true, true ],
    range: {
      'min': settings.probabilityRange.lowerBound,
      'max': settings.probabilityRange.upperBound
    }
  });

  var probRangeSlider2 = document.getElementById('probRange-slider-dist');
  noUiSlider.create(probRangeSlider2, {
    orientation: "vertical",
    direction: 'rtl',
    start: [settings.probabilityRange.lowerBound, settings.probabilityRange.upperBound],
    step: 0.1,
    behavior: 'drag',
    connect: true,
    tooltips: [ true, true ],
    range: {
      'min': settings.probabilityRange.lowerBound,
      'max': settings.probabilityRange.upperBound
    }
  });

  var distanceRangeSlider = document.getElementById('distanceRange-slider');
  noUiSlider.create(distanceRangeSlider, {
    orientation: "vertical",
    direction: 'rtl',
    start: [settings.distanceRange.lowerBound, settings.distanceRange.upperBound],
    step: settings.distanceAxisStep,
    behavior: 'drag',
    connect: true,
    tooltips: [ true, true ],
    range: {
      'min': settings.distanceRange.lowerBound,
      'max': settings.distanceRange.upperBound
    }
  });
  console.log(distanceRangeSlider)

  var draw = d3.line()
      .x(function (d) { return settings.xScalePath(d[0])} )
      .y(function (d) { return settings.yScalePath(getBinNum(d[1], settings.probabilityRange, settings.numBins)) + settings.margin.top })


  var drawPath = function(data, dataModel, settings, temp){
    var datapoints = [dataModel.classNames.map(function (d, i){
      return [ dataModel.classNames[i], +data[dataModel.probColumns[i]] ]
    })];
    //console.log(datapoints)
    //var data = [[["class0", 0.8],["class1", 0.7]]]

    if (temp == true){
      d3.select(".connect-histograms")
        .selectAll(".line")
        .data(datapoints)
        .enter().append("path")
        .attr("class", "click-line")
        .attr("d", draw)
    }
    else{
      d3.select(".connect-histograms")
      .selectAll(".hover-line")
      .data(datapoints)
      .attr("d", draw)
      .exit().remove()
    }
  }
  var boxPlots = new BoxPlot(dataModel, settings)
  var histograms = new DistributionHistogram(dataModel, settings, boxPlots);
  var distanceHistograms = new Histogram(dataModel, settings, settings.histogramTypes.distance);
  var probabilityHistograms = new Histogram(dataModel, settings, settings.histogramTypes.probability);
  var datatable = new DataTable(dataModel, settings)

  var moveSliders = function(){
    probRangeSlider.noUiSlider.set([settings.probabilityRangeDefault.lowerBound,
                                    settings.probabilityRangeDefault.upperBound]);
    probRangeSlider2.noUiSlider.set([settings.probabilityRangeDefault.lowerBound,
                                    settings.probabilityRangeDefault.upperBound]);
    distanceRangeSlider.noUiSlider.set([settings.distanceRangeDefault.lowerBound,
                                  settings.distanceRangeDefault.upperBound]);
  }

  var numFilter = 0;
  $('#filter').on('click', function(e){
    e.preventDefault();

    settings.calculateProbabilityRange(+probRangeSlider.noUiSlider.get()[0], +probRangeSlider.noUiSlider.get()[1]);
    settings.calculateProbabilityRange(+probRangeSlider2.noUiSlider.get()[0], +probRangeSlider2.noUiSlider.get()[1]);
    settings.calculateDistanceRange(+distanceRangeSlider.noUiSlider.get()[0], +distanceRangeSlider.noUiSlider.get()[1])

    settings.TPThreshold = +tpSlider.noUiSlider.get();
    settings.TNThreshold = 1 - (+tnSlider.noUiSlider.get());
    settings.display.TN = $('#tn').is(":checked")
    settings.display.TP = $('#tp').is(":checked")
    settings.display.FN = $('#fn').is(":checked")
    settings.display.FP = $('#fp').is(":checked")
    datatable.applyFilter(settings)
    numFilter += 1
    console.log(settings)
    histograms.updateData(histograms.constructData(dataModel, settings))
    distanceHistograms.updateData(distanceHistograms.constructData(dataModel, settings), settings.distanceRange)
    probabilityHistograms.updateData(probabilityHistograms.constructData(dataModel, settings), settings.probabilityRange)

    moveSliders()
  })

  $('#clearFilter').on('click', function(e){
    e.preventDefault();
    console.log(settings)
    datatable.clearFilter(numFilter)
    tpSlider.noUiSlider.set(settings.TPThresholdDefault)
    tnSlider.noUiSlider.set(1 - settings.TNThresholdDefault)
    moveSliders()
    //probRangeSlider.noUiSlider.set([settings.probabilityRangeDefault.lowerBound, settings.probabilityRangeDefault.upperBound])
    //distanceRangeSlider.noUiSlider.set([settings.distanceRangeDefault.lowerBound,settings.distanceRangeDefault.upperBound]);

    settings.display.TP = settings.displayDefault.TP
    settings.display.FN = settings.displayDefault.FN
    settings.display.FP = settings.displayDefault.FP
    settings.display.TN = settings.displayDefault.TN

    settings.TPThreshold = settings.TPThresholdDefault
    settings.TNThreshold = settings.TNThresholdDefault

    settings.probabilityRange.lowerBound = settings.probabilityRangeDefault.lowerBound
    settings.probabilityRange.upperBound = settings.probabilityRangeDefault.upperBound

    settings.distanceRange.lowerBound = settings.distanceRangeDefault.lowerBound
    settings.distanceRange.upperBound = settings.distanceRangeDefault.upperBound

    $( "#tn" ).prop( "checked", settings.display.TN );
    $( "#tp" ).prop( "checked", settings.display.TP );
    $( "#fn" ).prop( "checked", settings.display.FN );
    $( "#fp" ).prop( "checked", settings.display.FP );

    histograms.updateData(histograms.constructData(dataModel, settings))
    probabilityHistograms.updateData(probabilityHistograms.constructData(dataModel, settings), settings.probabilityRange)
    distanceHistograms.updateData(distanceHistograms.constructData(dataModel, settings), settings.distanceRange)

    d3.selectAll(".hover-line").remove();
    d3.selectAll(".click-line").remove();
    d3.select(".connect-histograms").append("path").attr("class", "hover-line")
  })

  $('#datatable tbody').on( 'click', 'tr', function () {
    drawPath(datatable.table.row(this).data(), dataModel, settings, true);
    //console.log(drawPath(table.row( this ).data(), dataModel));
  });

  $('#datatable tbody').on('mouseover', 'tr', function() {
    console.log(datatable.table.row(this).data())
    drawPath(datatable.table.row(this).data(), dataModel, settings, false);
  });
}
