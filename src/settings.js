function Settings(){
  this.TNThreshold = 0.1 //if lower than 0.1 then show
  this.TPThreshold = 0.8 //if lower than 0.5 than show
  this.display = { TP: true, FP: true, FN: true, TN: false }
}

// Settings Function

// VARIABLES
// classification options(TP, TN, FN, FP), default all selected
// TP threshold, default  1.0
// FN threshold, default 0.1
// number of bins, default 10
