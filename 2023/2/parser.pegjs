{{
	const combineMax = (a, b) => (
    	Object.keys({...a,...b}).reduce((acc,e)=>({...acc,[e]:Math.max(a[e]??0,b[e]??0)}),{})
    );
}}

list
    = line|.., delimiter|

delimiter
    = "\n"

line
    = "Game" _ nr:Integer ":" draws:draws {return {nr, maxDraw: draws}; }

draws
	= head:draw tail:(";" draw)* {
    	return tail.reduce((acc, e) => combineMax(acc, e[1]),
        	head);
      }

draw
	= head:set tail:("," set)* {
    	return tail.reduce((acc, e) => ({...acc,...e[1]}), head);
      }

set
	= _ cnt:Integer _ col:color {return {[col]: cnt};}
    
color
	= "red" / "green" / "blue"

Integer "integer"
  = [0-9]+ { return parseInt(text(), 10); }
_    
    = [ \t]*