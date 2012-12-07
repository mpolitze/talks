document.createSvg = function(tagName) {
    var svgNS = "http://www.w3.org/2000/svg";
    return this.createElementNS(svgNS, tagName);
};

pathfinder = function(){
    return {
    
    SIZE : 8,

    FREE    : 1,
    WALL    : 2,
    START   : 4,
    END     : 8,
    VISITED : 16,
    CLOSED  : 32,

    mapTemplate : [[1,1,1,1,1,1,1,1],
                   [1,0,0,0,0,0,0,1],
                   [1,0,0,1,0,0,0,1],
                   [1,0,0,1,1,0,0,1],
                   [1,0,0,0,0,0,0,1],
                   [1,0,1,0,0,1,0,1],
                   [1,0,0,0,0,0,0,1],
                   [1,1,1,1,1,1,1,1]],

    map : [],
    
    start : {x:3, y:6},
    end   : {x:4, y:2},

    colors : {wall: "#1D1D1D", 
              free:"white", 
              stroke:"#525252",
              start:"#E3A21A",
              end:"#B91D47",
              visited:"#2B5797",
              visited2:"#2D89EF"},

    stack : [],

	container: "",

    Initialize : function(container){
		this.container = container;
        this.map = [];
        for(i=0; i<this.SIZE; i++){
            this.map.push([]);
            for(j=0; j<this.SIZE; j++){
                if(this.mapTemplate[i][j] == 1) this.map[i].push(this.WALL);
                else this.map[i].push(this.FREE);
            }        
        }
        
        this.map[this.start.y][this.start.x] = this.START;
        this.map[this.end.y][this.end.x] = this.END;
    
        this.stack = [{pos:this.start, length:0, direction:2, distance:Math.abs(this.end.x-this.start.x)+Math.abs(this.end.y-this.start.y)}];
        
        var container = document.getElementById(container);
        if(container.hasChildNodes()){
            container.removeChild(container.firstChild);
        }
        container.appendChild(this.grid(this.SIZE, 65, this.colors));
    },


	ManhattanDistance : function(a,b){
		return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
	},

	DiagonalDistance : function(a,b){
		return Math.max(Math.abs(a.x-b.x), Math.abs(a.y-b.y));	
	},
	
	EuclideanDistance : function(a,b){
		var dx = Math.abs(a.x-b.x);
		var dy = Math.abs(a.y-b.y);
		return Math.sqrt((dx*dx)+(dy*dy));	
	},

    AStarSort : function(a,b){
        var h = (b.length+b.distance) - (a.length+a.distance);
		if(h==0){
			return b.distance-a.distance;
		}
		return h
    },

	AStarStep : function(){
		neighbours = [{dx:-1, dy:0},{dx:1, dy:0},{dx:0, dy:-1},{dx:0, dy:1}];	
		this.AStarStepGeneral(neighbours, this.ManhattanDistance, this.AStarSort);
	},
	
	AStarStepDiagonal : function(){
		neighbours = [{dx:-1, dy:0},{dx:1, dy:0},{dx:0, dy:-1},{dx:0, dy:1},{dx:-1, dy:-1},{dx:1, dy:-1},{dx:1, dy:1},{dx:-1, dy:1}];	
		this.AStarStepGeneral(neighbours, this.DiagonalDistance, this.AStarSort);
	},
	
	AStarStepEuclidean : function(){
		neighbours = [{dx:-1, dy:0},{dx:1, dy:0},{dx:0, dy:-1},{dx:0, dy:1},{dx:-1, dy:-1},{dx:1, dy:-1},{dx:1, dy:1},{dx:-1, dy:1}];	
		this.AStarStepGeneral(neighbours, this.EuclideanDistance, this.AStarSort);
	},

    AStarStepGeneral: function(neighbours, distance, heuristic){
        this.stack.sort(heuristic);
    
        var current = this.stack[this.stack.length-1].pos;
        var length = this.stack[this.stack.length-1].length;
        this.stack.pop();
        if(this.map[current.y][current.x] == this.END){
            alert("Done. Length: " + length);
            return;
        }
    
        this.boxes[current.y][current.x].setAttribute("fill",this.colors.visited);        
        this.map[current.y][current.x] = this.CLOSED;
	
		for(var i=0; i<neighbours.length; i++){
			n = {x:current.x+neighbours[i].dx, y:current.y+neighbours[i].dy};
			if(this.map[n.y][n.x] == this.FREE | this.map[n.y][n.x] == this.END){
				var dist = distance(this.end, n);
				this.stack.push({pos:{x:n.x, y:n.y}, length: length+distance(current,n), distance:dist});
				if(this.map[n.y][n.x] == this.FREE){
					this.boxes[n.y][n.x].setAttribute("fill",this.colors.visited2);
					this.texts[n.y][n.x].replaceChild(document.createTextNode((length+distance(current,n)).toFixed(1)+"+"+dist.toFixed(1)+"="+(length+1+dist).toFixed(1)), this.texts[n.y][n.x].firstChild);
				}
			}
		}
    },


    
    BFSBlindStep : function(){
        var current = this.stack[0].pos;
        var length = this.stack[0].length;
        if(this.map[current.y][current.x] == this.END){
            alert("Done. Length: " + length);
            return;
        }else if(this.map[current.y][current.x] == this.FREE){
            this.map[current.y][current.x] = this.VISITED;
        }  
    
        this.boxes[current.y][current.x].setAttribute("fill",this.colors.visited);
    
        if(this.map[current.y+1][current.x] == this.FREE | this.map[current.y+1][current.x] == this.END){
            this.stack.push({pos:{x:current.x, y:current.y+1}, length: length+1});
            if(this.map[current.y+1][current.x] == this.FREE){
                this.boxes[current.y+1][current.x].setAttribute("fill",this.colors.visited2);
                this.map[current.y+1][current.x] = this.VISITED;
            }
        }
        if(this.map[current.y-1][current.x] == this.FREE | this.map[current.y-1][current.x] == this.END){
            this.stack.push({pos:{x:current.x, y:current.y-1}, length: length+1});
            if(this.map[current.y-1][current.x] == this.FREE){
                this.boxes[current.y-1][current.x].setAttribute("fill",this.colors.visited2);
                this.map[current.y-1][current.x] = this.VISITED;
            }
        }    
        if(this.map[current.y][current.x+1] == this.FREE | this.map[current.y][current.x+1] == this.END){
            this.stack.push({pos:{x:current.x+1, y:current.y}, length: length+1});
            if(this.map[current.y][current.x+1] == this.FREE){
                this.boxes[current.y][current.x+1].setAttribute("fill",this.colors.visited2);
                this.map[current.y][current.x+1] = this.VISITED;
            }
        }    
        if(this.map[current.y][current.x-1] == this.FREE | this.map[current.y][current.x-1] == this.END){
            this.stack.push({pos:{x:current.x-1, y:current.y}, length: length+1});
            if(this.map[current.y][current.x-1] == this.FREE){
                this.boxes[current.y][current.x-1].setAttribute("fill",this.colors.visited2);
                this.map[current.y][current.x-1] = this.VISITED;
            }
        }
    
        this.stack = this.stack.slice(1);
    
        if(nFree == 0){
            this.boxes[current.y][current.x].setAttribute("fill",this.colors.visited2);        
        }
    },
    
    
    
    DFSBlindStep : function(){
        var current = this.stack[this.stack.length-1].pos;
        var length = this.stack[this.stack.length-1].length;
        if(this.map[current.y][current.x] == this.END){
            alert("Done. Length: " + length);
            return;
        }else if(this.map[current.y][current.x] == this.FREE){
            this.map[current.y][current.x] = this.VISITED;
        }  
    
        this.boxes[current.y][current.x].setAttribute("fill",this.colors.visited);
    
        var nFree = 0;
        if(this.map[current.y+1][current.x] == this.FREE | this.map[current.y+1][current.x] == this.END){
            this.stack.push({pos:{x:current.x, y:current.y+1}, length: length+1});
            nFree++;
        }
        if(this.map[current.y-1][current.x] == this.FREE | this.map[current.y-1][current.x] == this.END){
            this.stack.push({pos:{x:current.x, y:current.y-1}, length: length+1});
            nFree++;
        }    
        if(this.map[current.y][current.x+1] == this.FREE | this.map[current.y][current.x+1] == this.END){
            this.stack.push({pos:{x:current.x+1, y:current.y}, length: length+1});
            nFree++;
        }    
        if(this.map[current.y][current.x-1] == this.FREE | this.map[current.y][current.x-1] == this.END){
            this.stack.push({pos:{x:current.x-1, y:current.y}, length: length+1});
            nFree++;
        }
        if(nFree == 0){
            this.stack.pop();
            this.boxes[current.y][current.x].setAttribute("fill",colors.visited2);        
        }
    },
    
    BuggingBlindStep : function(){
        var current = this.stack[this.stack.length-1].pos;
        var length = this.stack[this.stack.length-1].length;
        var direction = this.stack[this.stack.length-1].direction;
        var nextDirection = 0;
        if(direction == 0 || direction == 1){
            nextDirection =2;            
        }else{
            nextDirection =0;
        }
    
        if(this.map[current.y][current.x] == this.END){
            alert("Done. Length: " + length);
            return;
        }else if(this.map[current.y][current.x] == this.VISITED){
            this.boxes[current.y][current.x].setAttribute("fill",this.colors.visited);
        }
    
        var neighbours = [{dx:-1, dy:0},{dx:1, dy:0},{dx:0, dy:-1},{dx:0, dy:1}];
    
        var s= 0;
        var steps = 0;
        for(var i=0; i<neighbours.length; i++){
            var n = neighbours[(i+nextDirection)%4];
            s=1;
            while(this.map[current.y+n.dy*s][current.x+n.dx*s] != this.WALL){   
                s++;
            }
            while(this.map[current.y+n.dy*s][current.x+n.dx*s] != this.FREE && this.map[current.y+n.dy*s][current.x+n.dx*s] != this.END && s>0){
                s--;   
            }
            if(this.map[current.y+n.dy*s][current.x+n.dx*s] == this.START){
                s--;
            }
            steps = s;
            for(s=1; s<=steps; s++){
                this.stack.push({pos:{x:current.x+n.dx*s, y:current.y+n.dy*s}, length: length+s, direction:(i+nextDirection)%4}); 
                if(this.map[current.y+n.dy*s][current.x+n.dx*s] != this.END){
                   this.map[current.y+n.dy*s][current.x+n.dx*s] = this.VISITED;                
                    this.boxes[current.y+n.dy*s][current.x+n.dx*s].setAttribute("fill",this.colors.visited2);
                }else{
                    return;
                }
            }
            if(steps>0) return;
        }
        
        this.stack.pop();
    }, 

    boxes : [],

    grid : function(numberPerSide, size, colors) {
        var pixelsPerSide = numberPerSide * size;
        var svg = document.createSvg("svg");
        svg.setAttribute("width", pixelsPerSide);
        svg.setAttribute("height", pixelsPerSide);
        svg.setAttribute("viewBox", [0, 0, numberPerSide * size, numberPerSide * size].join(" "));
    
        this.boxes = [];
		this.texts = [];
        
        for(var i = 0; i < numberPerSide; i++) {
            this.boxes.push([]);
			this.texts.push([]);
			
            for(var j = 0; j < numberPerSide; j++) {
              var g = document.createSvg("g");
              g.setAttribute("transform", ["translate(", j*size, ",", i*size, ")"].join(""));
              var number = numberPerSide * i + j;
              var box = document.createSvg("rect");
              box.setAttribute("width", size);
              box.setAttribute("height", size);
              switch(this.map[i][j]){
                  case this.WALL:
                      box.setAttribute("fill", this.colors.wall); break;
                  case this.START:
                      box.setAttribute("fill", this.colors.start); break;
                  case this.END:
                      box.setAttribute("fill", this.colors.end); break;
                  default:
                      box.setAttribute("fill", this.colors.free);
              }   
              box.setAttribute("stroke", this.colors.stroke);
              box.setAttribute("stroke-width", "1");
              box.setAttribute("id", "b" + i + "_" + j); 
			  
              this.boxes[i].push(box);
              g.appendChild(box);
			  
			  var text = document.createSvg("text");
			  text.appendChild(document.createTextNode(""));
			  text.setAttribute("fill", this.colors.wall);
			  text.setAttribute("font-size", 20);
			  text.setAttribute("x", 0);
			  text.setAttribute("y", size/2);
			  text.setAttribute("id", "t" + i + "_" + j);
			  
			  this.texts[i].push(text);
			  g.appendChild(text);
			  
              svg.appendChild(g);
            }  
        }
        var tmp = this;
        svg.addEventListener(
            "click",
            function(e){
                var id = e.target.id;
                var idx = id.indexOf("_");
                var i = id.slice(1,idx);
                var j = id.slice(idx+1,id.length);
                tmp.mapTemplate[i][j] = !tmp.mapTemplate[i][j];
                tmp.Initialize(tmp.container);
            },
            false);
        return svg;
    }
};
};