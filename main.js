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
