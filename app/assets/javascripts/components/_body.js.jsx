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
        <AllGames games={this.state.games} /> 
      </div> 
    ) 
  },

  handleNewGame(game) {
    console.log('make games!', game);
    var newGames = this.state.games.concat(game);
    this.setState({games: newGames});
  }
});
