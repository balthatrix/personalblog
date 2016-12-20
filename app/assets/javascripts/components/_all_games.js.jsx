var AllGames = React.createClass({ 
  games() {
    return this.props.games.map((game)=>{
        return (
        <div key={game.id}>
          <Game game={game}
            delClicked={this.delClicked.bind(this,game.id)}
            handleUpdate={this.gameUpdated} />
        </div>
       )
    })
  },

  gameUpdated(game) {
    console.log("game updated: ", game);
    $.ajax({
      url: `/api/v1/games/${game.id}`,
      type: 'PUT', 
      data: { game: game},
      success: () => {
        console.log('you did it!!!');
        this.props.onUpdated(game); // callback to swap objects 
      } 
    });
  },

  delClicked(id) {
    $.ajax({
      url: `/api/v1/games/${id}`, 
      type: 'DELETE', 
      success: (response) => { 
        this.props.onDeleteSuccess(id);
      }.bind(this)
    });
  },
  render() { 
    return ( 
         <div> 
  	   {this.games()}
    	 </div> 
    );
  }, 
});
