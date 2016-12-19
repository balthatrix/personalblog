var AllGames = React.createClass({ 
 
  
  games() {
    return this.props.games.map((game)=>{
        return (
        <div key={game.id}>
	  <h3>{game.title}</h3>
	  <p>{game.description}</p>
	</div>
       )
    })
  },
  render() { 
    return ( 
         <div> 
  	   {this.games()}
    	 </div> 
    );
  } 
});
