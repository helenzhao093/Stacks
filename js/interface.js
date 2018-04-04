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
    start: settings.TNThresholdDefault,
    connect: 'lower',
    tooltips: true,
    step: 0.01,
    range: {
      'min': settings.TNMin,
      'max': settings.TNMax
    }
  });

  var probRangeSlider = document.getElementById('probRange-slider');
  noUiSlider.create(probRangeSlider, {
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

  var similarityRangeSlider = document.getElementById('similarity-slider');
  noUiSlider.create(similarityRangeSlider, {
    start: [settings.similarityRange.lowerBound, settings.similarityRange.upperBound],
    step: settings.similarityRangeStep,
    behavior: 'drag',
    connect: true,
    tooltips: [ true, true ],
    range: {
      'min': settings.similarityRange.lowerBound,
      'max': settings.similarityRange.upperBound
    }
  });

  var draw = d3.line()
      .x(function (d) { return settings.xScale(d[0])} )
      .y(function (d) { return settings.yScale(getBinNum(d[1], settings)) + settings.margin.top })


  var drawPath = function(data, dataModel, settings, temp){
    var datapoints = [dataModel.classNames.map(function (d, i){
      return [ dataModel.classNames[i], +data[dataModel.probColumns[i]] ]
    })];
    console.log(datapoints)
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


  //console.log(dataModel)
  //this.histogramContainer = d3.select(".histograms")

  var boxPlots = new BoxPlot(dataModel, settings)
  var histograms = new Histogram(dataModel, settings, boxPlots);
  var datatable = new DataTable(dataModel, settings)

/*  probRangeSlider.noUiSlider.on('update', function(){
    settings.probabilityRange.lowerBound = +probRangeSlider.noUiSlider.get()[0];
    settings.probabilityRange.upperBound = +probRangeSlider.noUiSlider.get()[1];
    histograms.updateData(histograms.constructData(dataModel, settings))
  })*/


  var numFilter = 0;

  $('#filter').on('click', function(e){
    e.preventDefault();
    settings.probabilityRange.lowerBound = +probRangeSlider.noUiSlider.get()[0];
    settings.probabilityRange.upperBound = +probRangeSlider.noUiSlider.get()[1];
    settings.similarityRange.lowerBound = +similarityRangeSlider.noUiSlider.get()[0];
    settings.similarityRange.upperBound = +similarityRangeSlider.noUiSlider.get()[1];
    settings.TPThreshold = +tpSlider.noUiSlider.get();
    settings.TNThreshold = +tnSlider.noUiSlider.get();
    settings.display.TN = $('#tn').is(":checked")
    settings.display.TP = $('#tp').is(":checked")
    settings.display.FN = $('#fn').is(":checked")
    settings.display.FP = $('#fp').is(":checked")
    datatable.applyFilter(settings)
    numFilter += 1
    console.log(settings)
    histograms.updateData(histograms.constructData(dataModel, settings))
  })

  $('#clearFilter').on('click', function(e){
    e.preventDefault();
    console.log(settings)
    datatable.clearFilter(numFilter)
    tpSlider.noUiSlider.set(settings.TPThresholdDefault)
    tnSlider.noUiSlider.set(settings.TNThresholdDefault)
    probRangeSlider.noUiSlider.set([settings.probabilityRangeDefault.lowerBound, settings.probabilityRangeDefault.upperBound])
    similarityRangeSlider.noUiSlider.set([settings.similarityRangeDefault.lowerBound, settings.similarityRangeDefault.upperBound])
    settings.display.TN = settings.displayDefault.TN
    settings.display.TP = settings.displayDefault.TP
    settings.display.FN = settings.displayDefault.FN
    settings.display.FP = settings.displayDefault.FP
    settings.TPThreshold = settings.TPThresholdDefault
    settings.TNThreshold = settings.TNThresholdDefault
    settings.probabilityRange.lowerBound = settings.probabilityRangeDefault.lowerBound
    settings.probabilityRange.upperBound = settings.probabilityRangeDefault.upperBound
    settings.similarityRange.lowerBound = settings.similarityRangeDefault.lowerBound
    settings.similarityRange.upperBound = settings.similarityRangeDefault.upperBound
    console.log(settings)
    $( "#tn" ).prop( "checked", settings.display.TN );
    $( "#tp" ).prop( "checked", settings.display.TP );
    $( "#fn" ).prop( "checked", settings.display.FN );
    $( "#fp" ).prop( "checked", settings.display.FP );
    histograms.updateData(histograms.constructData(dataModel, settings))
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
