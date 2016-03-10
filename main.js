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

function DrawingDriver(ctx, w, h){
    this.w = w;
    this.h = h;
    this.noteWidth = this.w / 32;
    this.noteHeight = this.h / 48;
    this.ctx = ctx;
    this.scale = NoteScale(this.noteWidth, this.noteHeight);
    this._drawRect = function(x, y, w, h, color){
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }
    
    this.drawNote = function(note, color){
        var t = this.scale(note.start, note.note, note.end, 1);
        this._drawRect(t.x, this.h - t.y - t.h, t.w, t.h, color);
    }
    this.getY = function(y){
        return Math.floor((this.h - y ) / this.noteHeight)
    }
    this.getX = function(x){
        return Math.floor(x / this.noteWidth)
    }

    this.clear = function(){
        this.ctx.clearRect(0, 0, this.w, this.h);
    }
    
    this.createNote = function(ch, x, y, len){
        return new Note({
            ch: ch,
            start: this.getX(x),
            note: this.getY(y),
            end: len
        });
    }
    this.hitTest = function(note, x, y){
        return (
            note.start <= this.getX(x) &&
            note.start + note.end >= this.getX(x) &&
            this.getY(y) === note.note
        )
    }
}

function PianoRoll(options){
    var self = this;
    this.el = options.el;
    this.notes = options.notes ? options.notes : [];
    this.drv = new DrawingDriver(this.el.getContext("2d"), this.el.offsetWidth, this.el.offsetHeight);
    this.hoverNote = null;
    this.draw = function(){
        this.drv.clear();
        this.notes.forEach(function(note){
            self.drv.drawNote(note, "#FFF")
        })
        if(this.hoverNote){
            self.drv.drawNote(this.hoverNote, "rgba(255,255,255,0.5)");
        }
    }
    this.el.addEventListener("mousemove", function(e){
        self.hoverNote = self.drv.createNote(1, e.offsetX, e.offsetY, 1)
        self.draw();
    });
    
    this._hitTest = function(note){
        var matched = -1;
        for(var i = 0; i < self.notes.length; i++){
            var n = self.notes[i];
            if(
                n.note === note.note &&
                n.start <= note.start &&
                n.start + n.end - 1 >= note.start
            ){
                matched = i;
            }
        }
        return matched;
    }
    
    this.el.addEventListener("click", function(e){
        var note = self.drv.createNote(1, e.offsetX, e.offsetY, 1);
        var matched = self._hitTest(note);
        if(matched >= 0){
            self.notes.splice(matched, 1);
        }else{
            self.notes.push(note);
        }
    });
}

var el = document.querySelector(".canvas");
var piano = new PianoRoll({
    el : el
});

piano.draw();
