(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Note(options){
    this.ch = options.ch ? options.ch : 1;
    this.note = options.note ? options.note : 0;
    this.start = options.start ? options.start : 0;
    this.end = options.end ? options.end : 1;
    
}

function NoteScale(xScale, yScale){
    return function(x, y, w, h){
        return {
            x: x * xScale,
            y: y * yScale,
            w: xScale,
            h: yScale
        }
    }
}


function PianoRoll(options){
    var self = this;
    this.el = options.el;
    this.w = this.el.offsetWidth;
    this.h = this.el.offsetHeight;
    this.ctx = this.el.getContext("2d");
    this.notes = options.notes ? options.notes : [];
    this.noteWidth = this.w / 32;
    this.noteHeight = this.h / 48;
    this.scale = NoteScale(this.noteWidth, this.noteHeight);
    this.hoverNote = null;
    
    this._drawRect = function(x, y, w, h, color){
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }
    
    this.drawNote = function(note, color){
        var t = this.scale(note.start, note.note, note.end, 1);
        this._drawRect(t.x, this.h - t.y - t.h, t.w, t.h, color);
     }
     
    this.clear = function(){
        this.ctx.clearRect(0, 0, this.w, this.h);
    }
    
    this.draw = function(){
        this.clear();
        this.notes.forEach(function(note){
            self.drawNote(note, "#FFF")
        })
        
        if(this.hoverNote){
            self.drawNote(this.hoverNote, "rgba(255,255,255,0.5)");
        }
    }
    this.el.addEventListener("mousemove", function(e){
        self.hoverNote = new Note({
            ch: 1,
            note: Math.floor((self.h - e.offsetY ) / self.noteHeight),
            start: Math.floor(e.offsetX / self.noteWidth),
            end: 1
        })
        self.draw();
    });
    
    this.el.addEventListener("click", function(e){
        var note = new Note({
            ch: 1,
            note: Math.floor((self.h - e.offsetY ) / self.noteHeight),
            start: Math.floor(e.offsetX / self.noteWidth),
            end: 1
        })
        self.notes.push(note);
    });
}

var el = document.querySelector(".canvas");
var piano = new PianoRoll({
    el : el
});

piano.draw();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIE5vdGUob3B0aW9ucyl7XG4gICAgdGhpcy5jaCA9IG9wdGlvbnMuY2ggPyBvcHRpb25zLmNoIDogMTtcbiAgICB0aGlzLm5vdGUgPSBvcHRpb25zLm5vdGUgPyBvcHRpb25zLm5vdGUgOiAwO1xuICAgIHRoaXMuc3RhcnQgPSBvcHRpb25zLnN0YXJ0ID8gb3B0aW9ucy5zdGFydCA6IDA7XG4gICAgdGhpcy5lbmQgPSBvcHRpb25zLmVuZCA/IG9wdGlvbnMuZW5kIDogMTtcbiAgICBcbn1cblxuZnVuY3Rpb24gTm90ZVNjYWxlKHhTY2FsZSwgeVNjYWxlKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oeCwgeSwgdywgaCl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiB4ICogeFNjYWxlLFxuICAgICAgICAgICAgeTogeSAqIHlTY2FsZSxcbiAgICAgICAgICAgIHc6IHhTY2FsZSxcbiAgICAgICAgICAgIGg6IHlTY2FsZVxuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIFBpYW5vUm9sbChvcHRpb25zKXtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5lbCA9IG9wdGlvbnMuZWw7XG4gICAgdGhpcy53ID0gdGhpcy5lbC5vZmZzZXRXaWR0aDtcbiAgICB0aGlzLmggPSB0aGlzLmVsLm9mZnNldEhlaWdodDtcbiAgICB0aGlzLmN0eCA9IHRoaXMuZWwuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgIHRoaXMubm90ZXMgPSBvcHRpb25zLm5vdGVzID8gb3B0aW9ucy5ub3RlcyA6IFtdO1xuICAgIHRoaXMubm90ZVdpZHRoID0gdGhpcy53IC8gMzI7XG4gICAgdGhpcy5ub3RlSGVpZ2h0ID0gdGhpcy5oIC8gNDg7XG4gICAgdGhpcy5zY2FsZSA9IE5vdGVTY2FsZSh0aGlzLm5vdGVXaWR0aCwgdGhpcy5ub3RlSGVpZ2h0KTtcbiAgICB0aGlzLmhvdmVyTm90ZSA9IG51bGw7XG4gICAgXG4gICAgdGhpcy5fZHJhd1JlY3QgPSBmdW5jdGlvbih4LCB5LCB3LCBoLCBjb2xvcil7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCh4LCB5LCB3LCBoKTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5kcmF3Tm90ZSA9IGZ1bmN0aW9uKG5vdGUsIGNvbG9yKXtcbiAgICAgICAgdmFyIHQgPSB0aGlzLnNjYWxlKG5vdGUuc3RhcnQsIG5vdGUubm90ZSwgbm90ZS5lbmQsIDEpO1xuICAgICAgICB0aGlzLl9kcmF3UmVjdCh0LngsIHRoaXMuaCAtIHQueSAtIHQuaCwgdC53LCB0LmgsIGNvbG9yKTtcbiAgICAgfVxuICAgICBcbiAgICB0aGlzLmNsZWFyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMudywgdGhpcy5oKTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5kcmF3ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB0aGlzLm5vdGVzLmZvckVhY2goZnVuY3Rpb24obm90ZSl7XG4gICAgICAgICAgICBzZWxmLmRyYXdOb3RlKG5vdGUsIFwiI0ZGRlwiKVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgaWYodGhpcy5ob3Zlck5vdGUpe1xuICAgICAgICAgICAgc2VsZi5kcmF3Tm90ZSh0aGlzLmhvdmVyTm90ZSwgXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNSlcIik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBzZWxmLmhvdmVyTm90ZSA9IG5ldyBOb3RlKHtcbiAgICAgICAgICAgIGNoOiAxLFxuICAgICAgICAgICAgbm90ZTogTWF0aC5mbG9vcigoc2VsZi5oIC0gZS5vZmZzZXRZICkgLyBzZWxmLm5vdGVIZWlnaHQpLFxuICAgICAgICAgICAgc3RhcnQ6IE1hdGguZmxvb3IoZS5vZmZzZXRYIC8gc2VsZi5ub3RlV2lkdGgpLFxuICAgICAgICAgICAgZW5kOiAxXG4gICAgICAgIH0pXG4gICAgICAgIHNlbGYuZHJhdygpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGUpe1xuICAgICAgICB2YXIgbm90ZSA9IG5ldyBOb3RlKHtcbiAgICAgICAgICAgIGNoOiAxLFxuICAgICAgICAgICAgbm90ZTogTWF0aC5mbG9vcigoc2VsZi5oIC0gZS5vZmZzZXRZICkgLyBzZWxmLm5vdGVIZWlnaHQpLFxuICAgICAgICAgICAgc3RhcnQ6IE1hdGguZmxvb3IoZS5vZmZzZXRYIC8gc2VsZi5ub3RlV2lkdGgpLFxuICAgICAgICAgICAgZW5kOiAxXG4gICAgICAgIH0pXG4gICAgICAgIHNlbGYubm90ZXMucHVzaChub3RlKTtcbiAgICB9KTtcbn1cblxudmFyIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYW52YXNcIik7XG52YXIgcGlhbm8gPSBuZXcgUGlhbm9Sb2xsKHtcbiAgICBlbCA6IGVsXG59KTtcblxucGlhbm8uZHJhdygpO1xuIl19
