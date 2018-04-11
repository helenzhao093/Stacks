var selectDiv = document.getElementsByClassName("distance-select")
//console.log(selectDiv)
//get the first and only select element
//var selectElement = $('distance-select').getElementsByTagName
//console.log(selectElement)
var selectElement = selectDiv[0].getElementsByTagName("select")[0]

var selected = document.createElement("DIV")

selected.setAttribute("class", "select-selected")
selected.innerHTML = selectElement.options[selectElement.selectedIndex].innerHTML
selectDiv[0].append(selected)

var selectHide = document.createElement("div");
selectHide.setAttribute("class", "select-items select-hide")

var selectOption;
for (j = 0; j < selectElement.length; j++) {
  selectOption = document.createElement("div");
  selectOption.innerHTML = selectElement.options[j].innerHTML;
  selectOption.id = "distance_" + selectElement.options[j].innerHTML.toLowerCase();
  selectOption.addEventListener("click", function(e){
        var i, s, h;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        h = this.parentNode.previousSibling;
        for (i = 0; i < s.length; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            break;
          }
        }
        h.click();
    });
    selectHide.appendChild(selectOption);
}

selectDiv[0].appendChild(selectHide);
selected.addEventListener("click", function(e) {
    /*when the select box is clicked, close any other select boxes,
    and open/close the current select box:*/
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });

  function closeAllSelect(elmnt) {
    /*a function that will close all select boxes in the document,
    except the current select box:*/
    var x, y, i, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    for (i = 0; i < y.length; i++) {
      if (elmnt == y[i]) {
        arrNo.push(i)
      } else {
        y[i].classList.remove("select-arrow-active");
      }
    }
    for (i = 0; i < x.length; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add("select-hide");
      }
    }
  }
  /*if the user clicks anywhere outside the select box,
  then close all select boxes:*/
  document.addEventListener("click", closeAllSelect);
