function Interface(data){

  var that = this
  var dataModel = new DataModel(data);
  var settings = new Settings(dataModel);
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
  console.log(tpSlider)
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
  var draw = d3.line()
      .x(function (d) { return settings.xScale(d[0])} )
      .y(function (d) { return settings.yScale(getBinNum(d[1])) + settings.margin.top })


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
    /*var connect = d3.select(".connect-histograms")
      .selectAll(".line")
      .data(datapoints)
      .enter().append("path")
      .attr("text", function(d) {return d[0]})
      .attr("d", draw)
      .attr("class", function(d) { return (temp == true)? "perm-line" : "line"})*/
  }

  console.log(dataModel)
  //this.histogramContainer = d3.select(".histograms")

  var histograms = new Histogram(dataModel, settings);
  var datatable = new DataTable(dataModel, settings)

  $('#filter').on('click', function(e){
    e.preventDefault();
    settings.TPThreshold = +tpSlider.noUiSlider.get();
    settings.TNThreshold = +tnSlider.noUiSlider.get();
    settings.display.TN = $('#tn').is(":checked")
    settings.display.TP = $('#tp').is(":checked")
    settings.display.FN = $('#fn').is(":checked")
    settings.display.FP = $('#fp').is(":checked")
    datatable.applyFilter(settings)
    //datatable.filterDataTable(settings)
    //datatable.table.draw()
    histograms.updateData(histograms.constructData(dataModel, settings))
  })

  $('#clearFilter').on('click', function(e){
    e.preventDefault();
    datatable.clearFilter()
    tpSlider.noUiSlider.set(settings.TPThresholdDefault)
    tnSlider.noUiSlider.set(settings.TNThresholdDefault)
    settings.TPThreshold = +tpSlider.noUiSlider.get();
    settings.TNThreshold = +tnSlider.noUiSlider.get();
    settings.display = settings.displayDefault
    histograms.updateData(histograms.constructData(dataModel, settings))
    d3.selectAll("path").remove();
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
