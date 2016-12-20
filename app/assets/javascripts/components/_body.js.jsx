var Body = React.createClass({ 

  getInitialState() {
    return {games: []}
  },

  componentDidMount() { 
    $.getJSON('/api/v1/games.json', (response) => { 
      this.setState({ games: response });
    });
  },

  render() { 
    
    return ( 
      <div> 
        <NewGame onNewSuccess={this.handleNewGame} /> 
        <AllGames games={this.state.games} onUpdated={this.updateGame} onDeleteSuccess={this.removeGame} /> 
      </div> 
    ) 
  },

  removeGame(id) {
    var newGames = this.state.games.filter((game)=>{return game.id != id});
    this.setState({games: newGames});
  },

  updateGame(newGame) {
    var newGames = this.state.games.map((game)=>{
      if(game.id == newGame.id) {
        return newGame;
      } else {
        return game;
      }
    });
    this.setState({games: newGames});
  },

  handleNewGame(game) {
    var newGames = this.state.games.concat(game);
    this.setState({games: newGames});
  }
});
