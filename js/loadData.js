$(document).ready(function(){

  // load the dataset
  loadDataset = function(){
    d3.csv("datasets/multiclass/euclid_similarity_100_random_forest_4_classes_dataset.csv", type, function(error, data) {
    //d3.csv("datasets/multiclass/cosine_similarity_1000_random_forest_4_classes_dataset.csv", type, function(error, data) {
      console.log(data)
      interface = new Interface(data)
    })
  }

  //convert strings to number
  function type(d) {
    for (var key in d){
      if (key.substring(0, 4) == "prob"){
        d[key] = +Number.parseFloat(d[key]).toPrecision(3);
      }
      else if(key.substring(0, 7) == "feature"){
        d[key] = +Number.parseFloat(d[key]).toPrecision(5);
      }
      else{
        d[key] = +d[key]
      }
    }
    return d;
  }

  loadDataset();
});
