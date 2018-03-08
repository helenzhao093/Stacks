$(document).ready(function(){

  // load the dataset
  loadDataset = function(){
    d3.csv("datasets/multilabel/random_forest_ml_4_classesdataset.csv", type, function(error, data) {
      console.log(data)
      console.log(data[0].prob0);
      interface = new Interface(data)
    })
  }

  //convert strings to number
  function type(d) {
    for (var key in d){
      d[key] = +d[key]
    }
    return d;
  }

  loadDataset();
});
