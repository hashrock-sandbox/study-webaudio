var d3 = require("d3");

var MyChart = function(options){
    this.el = options.el;
    this.width = options.width ? options.width : 300;
    this.height = options.height ? options.height : 300;
    this.create = options.create;
    this.update = options.update;
    this.canvas = null;
}

var chart = new MyChart({
    el: "body",
    width: 960,
    height: 500,
    create: function(){
        this.canvas = d3.select(this.el).append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
        .append("g")
            .attr("transform", "translate(32," + (this.height / 2) + ")");
    },
    update: function(data){
        var text = this.canvas.selectAll("text")
            .data(data);
        text.attr("class", "update");
        text.enter().append("text")
            .attr("class", "enter")
            .attr("x", function(d, i) { return i * 32; })
            .attr("dy", ".35em");
        text.text(function(d) { return d; });
        text.exit().remove();
    }
});


var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

var width = 960,
    height = 500;


chart.create();
chart.update(alphabet);

document.querySelector(".update")
.addEventListener("click", function(){
    var talphabet = d3.shuffle(alphabet)
      .slice(0, Math.floor(Math.random() * 26))
      .sort()
    chart.update(talphabet);
})