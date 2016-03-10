(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Note(options){
    this.ch = options.ch ? options.ch : 1;
    this.note = options.note ? options.note : 0;
    this.start = options.start ? options.start : 0;
    this.end = options.end ? options.end : 1;
    
}

function PianoRoll(options){
    this.el = options.el;
    this.w = this.el.offsetWidth;
    this.h = this.el.offsetHeight;
    this.ctx = this.el.getContext("2d");
    this.notes = [
        new Note({
            ch: 1,
            note: 3,
            start: 2,
            end: 1
        }),
        new Note({
            ch: 1,
            note: 4,
            start: 3,
            end: 3
        })
    ];
    this.drawNote = function(note){
        this.ctx.fillStyle = "#FFF";
        var noteHeight = this.h / 48;
        var noteWidth = this.w / 32;
        this.ctx.fillStyle = "#FFF";
        this.ctx.fillRect(
            noteWidth * note.start,
            this.h - noteHeight * note.note,
            noteWidth * note.end,
            noteHeight
        );
        console.log(
            noteWidth * note.start,
            this.h - noteHeight * note.note,
            noteWidth * note.end,
            noteHeight
            
        )
     }
    var self = this;
    this.clear = function(){
        this.ctx.clearRect(0, 0, this.w, this.h);
    }
    
    this.ready = function(){
        this.clear();
        this.notes.forEach(function(note){
            self.drawNote(note)
        })
    }
    this.el.addEventListener("mousemove", function(e){
        self.mx = e.offsetX;
        self.my = e.offsetY;
    });

    this.el.addEventListener("click", function(e){
        self.mx = e.offsetX;
        self.my = e.offsetY;
        console.log("c");
    });
}

var el = document.querySelector(".canvas");
var piano = new PianoRoll({
    el : el
});

piano.ready();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZnVuY3Rpb24gTm90ZShvcHRpb25zKXtcbiAgICB0aGlzLmNoID0gb3B0aW9ucy5jaCA/IG9wdGlvbnMuY2ggOiAxO1xuICAgIHRoaXMubm90ZSA9IG9wdGlvbnMubm90ZSA/IG9wdGlvbnMubm90ZSA6IDA7XG4gICAgdGhpcy5zdGFydCA9IG9wdGlvbnMuc3RhcnQgPyBvcHRpb25zLnN0YXJ0IDogMDtcbiAgICB0aGlzLmVuZCA9IG9wdGlvbnMuZW5kID8gb3B0aW9ucy5lbmQgOiAxO1xuICAgIFxufVxuXG5mdW5jdGlvbiBQaWFub1JvbGwob3B0aW9ucyl7XG4gICAgdGhpcy5lbCA9IG9wdGlvbnMuZWw7XG4gICAgdGhpcy53ID0gdGhpcy5lbC5vZmZzZXRXaWR0aDtcbiAgICB0aGlzLmggPSB0aGlzLmVsLm9mZnNldEhlaWdodDtcbiAgICB0aGlzLmN0eCA9IHRoaXMuZWwuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgIHRoaXMubm90ZXMgPSBbXG4gICAgICAgIG5ldyBOb3RlKHtcbiAgICAgICAgICAgIGNoOiAxLFxuICAgICAgICAgICAgbm90ZTogMyxcbiAgICAgICAgICAgIHN0YXJ0OiAyLFxuICAgICAgICAgICAgZW5kOiAxXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgTm90ZSh7XG4gICAgICAgICAgICBjaDogMSxcbiAgICAgICAgICAgIG5vdGU6IDQsXG4gICAgICAgICAgICBzdGFydDogMyxcbiAgICAgICAgICAgIGVuZDogM1xuICAgICAgICB9KVxuICAgIF07XG4gICAgdGhpcy5kcmF3Tm90ZSA9IGZ1bmN0aW9uKG5vdGUpe1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcIiNGRkZcIjtcbiAgICAgICAgdmFyIG5vdGVIZWlnaHQgPSB0aGlzLmggLyA0ODtcbiAgICAgICAgdmFyIG5vdGVXaWR0aCA9IHRoaXMudyAvIDMyO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcIiNGRkZcIjtcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoXG4gICAgICAgICAgICBub3RlV2lkdGggKiBub3RlLnN0YXJ0LFxuICAgICAgICAgICAgdGhpcy5oIC0gbm90ZUhlaWdodCAqIG5vdGUubm90ZSxcbiAgICAgICAgICAgIG5vdGVXaWR0aCAqIG5vdGUuZW5kLFxuICAgICAgICAgICAgbm90ZUhlaWdodFxuICAgICAgICApO1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIG5vdGVXaWR0aCAqIG5vdGUuc3RhcnQsXG4gICAgICAgICAgICB0aGlzLmggLSBub3RlSGVpZ2h0ICogbm90ZS5ub3RlLFxuICAgICAgICAgICAgbm90ZVdpZHRoICogbm90ZS5lbmQsXG4gICAgICAgICAgICBub3RlSGVpZ2h0XG4gICAgICAgICAgICBcbiAgICAgICAgKVxuICAgICB9XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuY2xlYXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53LCB0aGlzLmgpO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLnJlYWR5ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB0aGlzLm5vdGVzLmZvckVhY2goZnVuY3Rpb24obm90ZSl7XG4gICAgICAgICAgICBzZWxmLmRyYXdOb3RlKG5vdGUpXG4gICAgICAgIH0pXG4gICAgfVxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbihlKXtcbiAgICAgICAgc2VsZi5teCA9IGUub2Zmc2V0WDtcbiAgICAgICAgc2VsZi5teSA9IGUub2Zmc2V0WTtcbiAgICB9KTtcblxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBzZWxmLm14ID0gZS5vZmZzZXRYO1xuICAgICAgICBzZWxmLm15ID0gZS5vZmZzZXRZO1xuICAgICAgICBjb25zb2xlLmxvZyhcImNcIik7XG4gICAgfSk7XG59XG5cbnZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FudmFzXCIpO1xudmFyIHBpYW5vID0gbmV3IFBpYW5vUm9sbCh7XG4gICAgZWwgOiBlbFxufSk7XG5cbnBpYW5vLnJlYWR5KCk7XG4iXX0=
