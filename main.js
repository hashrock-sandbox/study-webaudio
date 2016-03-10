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
