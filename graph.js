const dims={height:300,width:300,raduis:150};
const cent={ x: (dims.width/2+5),y:(dims.height/2+5)};

const svg = d3.select('.canvas')
	.append('svg')
	.attr('width',dims.width + 150)
	.attr('height',dims.height + 150);

	const graph= svg.append('g')
	  .attr('transform', `translate(${cent.x}, ${cent.y})`);

	const pie =d3.pie()
	  .sort(null)
	  .value(d=> d.cost);
	
	
	  const arcPath= d3.arc()
	  .outerRadius(dims.raduis)
	  .innerRadius(dims.raduis/2);

	  const colour = d3.scaleOrdinal(d3['schemeSet3']);

	  // legend  setup
	  const legendGroup= svg.append('g')
		.attr('transform',`translate (${dims.width + 40}, 10)`);
		 
		const  legend = d3.legendColor()
		  .shape('circle')
		  .shapePadding(10)
		  .scale(colour);

		  const tip = d3.tip()
			.attr('class',' tip card')
			.html(d => {
			  let content = `<div class= "name">${d.data.name}</div>`;
			  content += `<div class ="cost">${d.data.cost}</div>`;
			  content += `<div calss="delete"> Click slice to delete </div> `;
			  return content ;
			});

			graph.call(tip);
			
 //updat function
	  const update =(data)=>{

		//update colour scale domain
		colour.domain(data.map(d=> d.name));

		// update  and call  legend 
		legendGroup.call(legend);
		legendGroup.selectAll('text').attr('fill','white');



		const paths= graph.selectAll('path')
		  .data(pie(data));

		  //handle the exit solution
		  paths.exit()
		   .transition().duration(750)
		   .attrTween('d',acrTweenExit)
		   .remove();

		  //hanlde the current  DOM path update
		  paths.attr('d',arcPath)
			.transition().duration(750)
			.attrTween('d',arcTweenUpdate);

		paths.enter()
		 .append('path')
		   .attr('class','arc')
		   .attr('stroke','#fff')
		   .attr('stroke-width',3)
		   .attr('fill',d=> colour(d.data.name))
		   .each(function(d){ this._current= d})
		   .transition().duration(750)
			 .attrTween("d", acrTweenEnter);
			 //add events
			 graph.selectAll('path')
			   .on('mouseover',(d,i,n)=>{
				   tip.show(d, n[i]);
				   handleMouseOver(d,i,n);
			   })
			   .on('mouseout',(d,i,m) =>{
				   tip.hide();
				   handleMouseOut(d,i,n);
			   })
			   .on('click', handleClick);

	  };



	  var data=[];

	  db.collection('expenses').onSnapshot(res=>{
		  
		res.docChanges().forEach(change => {
			const doc={...change.doc.data(),id:change.doc.id};


			switch(change.type){
				case 'added':
				data.push(doc);
				break;
				case 'modified':
				const index= data.findIndex(item=> item.id== doc.id);
				data[index]=doc;
				break;
				case 'removed':
				data= data.filter(item=>item.id !== doc.id);
				break;
				default:
				break;
			}
			
		});
		update(data);
		
	  });

	  const acrTweenEnter= (d) =>{
		  var i = d3.interpolate(d.endAngle, d.startAngle);

		  return function(t){
			  d.startAngle= i(t);
			  return arcPath(d);
		  }
	  };
	  const acrTweenExit= (d) =>{
		var i = d3.interpolate(d.startAngle, d.endAngle);
		
		
		return function(t){
			d.startAngle= i(t);
			return arcPath(d);
		}
	};

	//use function  keyword to allow  use of 'this
	function arcTweenUpdate(d){

		// interpolate between teh two object
		var i = d3.interpolate(this._current , d)
		// update the current  prop  with the new updated data 
		this._current= d;

		return function(t){
			return arcPath(i(t));
		}
		
 }

 // event handlers 
 const handleMouseOver= (d ,i , n)=>{
	 //console.log(n[i])
	 d3.select(n[i])
	 .transition(changeSliceFill).duration(300)
	   .attr('fill','#fff');
 };
 const handleMouseOut= (d ,i ,n)=>{
	 d3.select(n[i])
	 .transition(changeSliceFill).duration(300)
	   .attr('fill',colour(d.data.name))
 };
 const handleClick= (d) => {
	 const id = d.data.id;
	 db.collection('expenses').doc(id).delete();
 }








	