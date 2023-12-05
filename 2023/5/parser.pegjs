almanach
	= seeds:seeds newline+ maps:maps .*
    {return {seeds, maps}; }

seeds
	= "seeds: " numberlist:numberlist
    { return numberlist; }
    
numberlist
	= Integer|.., _|

maps
	= map:map|.., newline+|
    { return map.reduce((acc, e) => ({...acc, [e.from]: e}), {}); }
    
map
	= header:mapheader newline data:mapdata
    { return {...header, data}; }
    
mapheader
	= name:mapname " map:"
    { return name; }

mapname
	= from:$[a-z]+ "-to-" to:$[a-z]+
    { return {from, to}; }

mapdata
	= data:mapdataline|.., newline|
    { return data.sort((a, b) => a.src - b.src); }

mapdataline
	= dest:Integer _ src:Integer _ len:Integer
    { return {dest, src, len}; }

newline
    = "\n"

Integer "integer"
  = [0-9]+ { return parseInt(text(), 10); }
_    
    = [ \t]*