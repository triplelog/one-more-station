export class ShortestPath {
    constructor() {
        this.nodes = {};
        this.edges = {};
        this.unvisited = [];
        this.current = false;
        this.pathBack = {};
        this.tracksBack = {};
    }
    addNode(id) {
        this.nodes[id]={d:Infinity,v:false};
    }
    deleteNode(id,deleteEdges=false) {
        delete this.nodes[id];
        if (deleteEdges){
            for (var o in this.edges){
                delete this.edges[o][id];
                for (var n in this.edges[o]){
                    for (var i=this.edges[o][n].length-1;i>=0;i--){
                        if (this.edges[o][n][i][0] == id){
                            this.edges[o][n].splice(i,1);
                        }
                    }
                }
            }
        }
    }
    addEdge(a,b,weight,id,line=-1){
        if (!this.edges[line]){this.edges[line] = {}}
        if (!this.edges[line][a]){this.edges[line][a]=[];}
        if (!this.edges[line][b]){this.edges[line][b]=[];}
        this.edges[line][a].push([b,weight,id]);
        this.edges[line][b].push([a,weight,id]);
    }
    addDirectedEdge(a,b,weight,id,line=-1){
        if (!this.edges[line]){this.edges[line] = {}}
        if (!this.edges[line][a]){this.edges[line][a]=[];}
        this.edges[line][a].push([b,weight,id]);
    }
    deleteEdge(a,b,weight=-1,line=-2){
        
    }
    deleteDirectedEdge(a,b,weight=-1,line=-2){
        
    }

    visitNeighbors(lines){
        var edges = [];
        for (var i=0;i<lines.length;i++){
            if (this.edges[lines[i]][this.current]){
                edges = edges.concat(this.edges[lines[i]][this.current]);
            }
        }
        for (var i=0, len = edges.length;i<len;i++){
            let n = edges[i][0];
            if (!this.nodes[n].v){
                let dNew = edges[i][1];
                if (this.nodes[this.current].d + dNew < this.nodes[n].d){
                    this.nodes[n].d = this.nodes[this.current].d + dNew;
                    this.pathMap["node-"+n] = [this.current];
                    this.tracksMap["node-"+n] = edges[i][2];
                }
            }
            
        }
    }
    
    shortestPath(a,b,line){
        let lines = [];
        if (Array.isArray(line)){lines = line;}
        else {lines = [line];}
        for (var i=lines.length-1;i>=0;i--){
            if (lines[i] == -1){
                lines = [-1];
                for (var j in this.edges){
                    lines.push(j);
                }
                break;
            }
            
        }
        for (var i=lines.length-1;i>=0;i--){
            if (!this.edges[lines[i]]){lines.splice(i,1)}
        }
        this.unvisited = [a];
        this.pathMap = {};
        this.tracksMap = {};
        for (var n in this.nodes){
            if (n != a){
                this.unvisited.push(n);
            }
            this.nodes[n]={d:Infinity,v:false};
        }
        this.nodes[a]={d:0,v:false};
        this.current = a;
    
    
        while(this.current != b && this.nodes[this.current].d < Infinity) {
            this.visitNeighbors(lines);
            this.nodes[this.current].v = true;
            this.unvisited.splice(0,1);
    
            if (this.unvisited.length == 0){break;}
            this.unvisited.sort((a,b) => {return this.nodes[a].d - this.nodes[b].d})
            this.current = this.unvisited[0];
        }
        var reversePath = [b];
        var reverseTracks = [this.tracksMap["node-"+b]];
        var next = this.pathMap["node-"+b];
        while(next && next.length > 0){
            reversePath.push(next[0]);
            var nextTrack = this.tracksMap["node-"+next[0]];
            next = this.pathMap["node-"+next[0]];
            if (next && next.length > 0){
                reverseTracks.push(nextTrack);
            }
            
        }
        reversePath.reverse();
        reverseTracks.reverse();
        var dd = Infinity;
        if (this.nodes[b]){
            dd = this.nodes[b].d;
        }
        return {path:reversePath,d:dd,newTracks:reverseTracks}
    
    }

}
