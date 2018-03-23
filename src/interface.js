function Interface(data){

  //this.histogramContainer = d3.select(".histograms")
  var that = this
  var dataModel = new DataModel(data);
  var settings = new Settings();
  console.log(dataModel)
  var datatable = new DataTable(dataModel, settings)
  var histograms = new Histogram(dataModel, settings);
}


// initialize default Settings

// bind containers for histogram and data table

// create sliders for filtering high probability TPs

// create slider for filtering low probability TNs

// initialize interface with data from csv files

  //VARIABLS
  // data model

  // initialize data table with model

  // initialize box plot with model

  // initialize histograms with Model

  //FUNCTIONS
  // create action listeners for checking and applying new classification options

  // create action listeners for filtering TPs

  // create action listeners for filtering TNs
