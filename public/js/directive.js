app.directive('loadedImg', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind("load", function(e) {
        equalHeight("product");
      });
    }
  }
});

function equalHeight(className) {
  var div = document.getElementsByClassName(className);
  var tallest = 0;
  for (i = 0; i < div.length; i++) {
    div[i].style.height = '';
    var ele = div[i];
    var eleHeight = ele.offsetHeight;
    tallest = (eleHeight > tallest ? eleHeight : tallest);
  }
  var findClass = document.getElementsByClassName(className);
  for (i = 0; i < findClass.length; i++) {
    findClass[i].style.height = tallest + "px";
  }
}
