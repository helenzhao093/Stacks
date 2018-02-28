function Interface(data){

  //this.histogramContainer = d3.select(".histograms")

  var dataModel = new DataModel(data);
  console.log(dataModel)
  var histograms = new Histogram(dataModel);
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
