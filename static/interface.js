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
    start: [0, 1],
    step: 0.1,
    behavior: 'drag',
    connect: true,
    tooltips: [ true, true ],
    range: {
      'min': 0,
      'max': 1
    }
  });
  console.log(distanceRangeSlider)

  var draw = d3.line()
      .x(function (d) { return 20 + settings.xScalePath(d[0])} )
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
  var distanceHistograms = new Histogram(dataModel, settings, settings.histogramTypes.distance, boxPlots);
  var probabilityHistograms = new Histogram(dataModel, settings, settings.histogramTypes.probability, boxPlots);
  var datatable = new DataTable(dataModel, settings)

  var moveSliders = function(){
    probRangeSlider.noUiSlider.set([settings.probabilityRangeDefault.lowerBound,
                                    settings.probabilityRangeDefault.upperBound]);
    probRangeSlider2.noUiSlider.set([settings.probabilityRangeDefault.lowerBound,
                                    settings.probabilityRangeDefault.upperBound]);
    distanceRangeSlider.noUiSlider.set([0, 1]);
  }

  var applySettings = function(){
    histograms.updateData(histograms.constructData(dataModel.data, settings))
    distanceHistograms.updateData(distanceHistograms.constructData(dataModel.data, settings), settings.distanceRange)
    probabilityHistograms.updateData(probabilityHistograms.constructData(dataModel.data, settings), settings.probabilityRange)
    moveSliders()
  }

  var numFilter = 0;
  var filterStack = []
  var addFilter = function(){
    numFilter += 1
    filterStack.push({
      TPThreshold: settings.TPThreshold,
      TNThreshold: settings.TNThreshold,
      display: {
        TN: settings.display.TN,
        TP: settings.display.TP,
        FN: settings.display.FN,
        FP: settings.display.FP
      },
      probabilityRange:{
        lowerBound: settings.probabilityRange.lowerBound,
        upperBound: settings.probabilityRange.upperBound
      },
      distanceRange: {
        lowerBound: settings.distanceRange.lowerBound,
        upperBound: settings.distanceRange.upperBound
      },
      distanceMeasure: settings.distanceMeasure
    })
    console.log(filterStack)
  }

  var setSettings = function(newSettings){
    settings.display.TP = newSettings.display.TP
    settings.display.FN = newSettings.display.FN
    settings.display.FP = newSettings.display.FP
    settings.display.TN = newSettings.display.TN

    settings.TPThreshold = newSettings.TPThreshold
    settings.TNThreshold = newSettings.TNThreshold

    tpSlider.noUiSlider.set(settings.TPThreshold)
    tnSlider.noUiSlider.set(1 - settings.TNThreshold)

    settings.probabilityRange.lowerBound = newSettings.probabilityRange.lowerBound
    settings.probabilityRange.upperBound = newSettings.probabilityRange.upperBound

    settings.distanceRange.lowerBound = newSettings.distanceRange.lowerBound
    settings.distanceRange.upperBound = newSettings.distanceRange.upperBound

    $( "#tn" ).prop( "checked", newSettings.display.TN );
    $( "#tp" ).prop( "checked", newSettings.display.TP );
    $( "#fn" ).prop( "checked", newSettings.display.FN );
    $( "#fp" ).prop( "checked", newSettings.display.FP );
  }

  $('#apply').on('click', function(e){
    e.preventDefault();

    $('#undo').css("display", "inline");

    addFilter()

    settings.calculateProbabilityRange(+probRangeSlider.noUiSlider.get()[0], +probRangeSlider.noUiSlider.get()[1]);
    settings.calculateProbabilityRange(+probRangeSlider2.noUiSlider.get()[0], +probRangeSlider2.noUiSlider.get()[1]);
    settings.calculateDistanceRange(+distanceRangeSlider.noUiSlider.get()[0], +distanceRangeSlider.noUiSlider.get()[1])

    if (settings.probabilityRange.upperBound < settings.TPThreshold){
      tpSlider.noUiSlider.set(settings.probabilityRange.upperBound)
    }
    if (settings.probabilityRange.lowerBound > settings.TNThreshold){
      tnSlider.noUiSlider.set(1 - settings.probabilityRange.lowerBound)
    }

    settings.TPThreshold = +tpSlider.noUiSlider.get();
    settings.TNThreshold = 1 - (+tnSlider.noUiSlider.get());
    settings.display.TN = $('#tn').is(":checked")
    settings.display.TP = $('#tp').is(":checked")
    settings.display.FN = $('#fn').is(":checked")
    settings.display.FP = $('#fp').is(":checked")

    datatable.applyFilter(settings)
    applySettings()
  })

  $('#undo').on('click', function(e){
    oldSettings = filterStack.pop()
    console.log(oldSettings)
    numFilter -= 1
    if (numFilter == 0){
      $(this).css("display", "none");
    }
    setSettings(oldSettings)
    datatable.clearFilter(1)
    applySettings()
  })

  var removePaths = function(){
    d3.selectAll(".hover-line").remove();
    d3.selectAll(".click-line").remove();
    d3.select(".connect-histograms").append("path").attr("class", "hover-line")
  }

  var removeAllHighlights = function(){
    var all = $(".FP, .TP, .FN, .TN")
    all.removeClass("highlight")
  }

  var clearSelectedInfo = function(){
    histograms.clearSelected()
    probabilityHistograms.clearSelected()
    distanceHistograms.clearSelected()
    removeAllHighlights()
  }

  $('#clear').on('click', function(e){
    e.preventDefault();

    datatable.clearFilter(numFilter)
    $('#undo').css("display", "none");

    tpSlider.noUiSlider.set(settings.TPThresholdDefault)
    tnSlider.noUiSlider.set(1 - settings.TNThresholdDefault)
    setSettings(settings.default)
    currentData = dataModel.data
    d3.selectAll(".svg-boxplot").remove()
    d3.selectAll(".legend-row").remove()
    applySettings()
    clearSelectedInfo()
    removePaths()
  })
  var currentData = dataModel.data

  $('#filter').on('click', function(e){
    e.preventDefault();
    var selectedInfo
    if (currentSelect == "probability-tab"){
      selectedInfo = probabilityHistograms.getSelectedInfo()
    }
    else if (currentSelect == "distance-tab"){
      selectedInfo = distanceHistograms.getSelectedInfo()
    }
    else {
      selectedInfo = histograms.getSelectedInfo()
    }
    console.log(selectedInfo)
    if (selectedInfo.length > 0) {
      currentData = filterAllData(selectedInfo)
      //filteredDataModel = new DataModel(data)
      histograms.updateData(histograms.constructData(currentData, settings))
      distanceHistograms.updateData(distanceHistograms.constructData(currentData, settings), settings.distanceRange)
      probabilityHistograms.updateData(probabilityHistograms.constructData(currentData, settings), settings.probabilityRange)
      removeAllHighlights()
    }
  })

  var filterAllData = function(selectedInfo){
    var allFilteredData = []
    for (var i = 0; i < selectedInfo.length; i++){
      allFilteredData = allFilteredData.concat(filterData(selectedInfo[i]))
    }
    return allFilteredData
  }

  var filterData = function(selectedInfo){
    var svgClass = ""
    if (selectedInfo.classification == "TP" || selectedInfo.classification == "FP"){
      svgClass = "predictedClass"
    } //if TP and FP used prob of predictedclass  (FN used probability of the class that it was pred)
    else{
      svgClass = "actualClass"
    }
    var filtered = dataModel.data.filter(example => example["actual" + selectedInfo["actualClass"]] == 1)
      .filter(example => example["predicted" + selectedInfo["predictedClass"]] == 1)

    if (selectedInfo.distance){
      filtered = filtered.filter(example => getBinNum(example[settings.distanceMeasure], settings.distanceRange, settings.numBins) == selectedInfo["binNum"])
    }
    else {
      filtered = filtered.filter(example => getBinNum(example["prob" + selectedInfo[svgClass]], settings.probabilityRange, settings.numBins) == selectedInfo["binNum"])
    }
    //console.log(filtered)
    return filtered
  }

  $("#features-button").on('click', function(){
    var selectedInfo
    var histogramData
    if (currentSelect == "probability-tab"){
      selectedInfo = probabilityHistograms.getSelectedInfo()
      histogramData = probabilityHistograms.getHistogramData()
    }
    else if(currentSelect == "distance-tab"){
      selectedInfo = distanceHistograms.getSelectedInfo()
      histogramData = distanceHistograms.getHistogramData()
    }
    else{
      selectedInfo = histograms.getSelectedInfo()
      histogramData = histograms.getHistogramData()
    }
    if (selectedInfo.length > 0) {
      boxPlots.makeComparison(selectedInfo, histogramData, dataModel.data)
    }
    $('#' + currentSelect).css('display', "none");
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++){
      //console.log(tablinks[i])
      tablinks[i].classList.remove("active");
    }
    $("#features-button").addClass("active")
    $('#feature-tab').css('display', "block");
    currentSelect = "feature-tab";
  })

  $('#datatable tbody').on( 'click', 'tr', function () {
    drawPath(datatable.table.row(this).data(), dataModel, settings, true);
    //console.log(drawPath(table.row( this ).data(), dataModel));
  });

  $('#datatable tbody').on('mouseover', 'tr', function() {
    console.log(datatable.table.row(this).data())
    drawPath(datatable.table.row(this).data(), dataModel, settings, false);
  });

  settings.distanceMeasures.forEach(function(distance){
    $('#'+ distance).on('click', function(){
      newDistanceSelected(this)
    })
  })

  var newDistanceSelected = function(select_item){
    console.log(select_item)
    // change distance measure in settings and recalculate the distance range
    settings.distanceMeasure = select_item.id;
    settings.calculateDistanceMetadata()
    boxPlots.distanceMeasure = settings.distanceMeasure
    // update the distance histograms distance measure and redraw the histograms
    distanceHistograms.histogramType.getBinNum[0] = settings.distanceMeasure;
    distanceHistograms.updateData(distanceHistograms.constructData(currentData, settings), settings.distanceRange)
  }
}
