
var IframedGame = React.createClass({

 
  getInitialState() {
    return {
      source_url: "" 
    };
  },

  componentDidMount() {
    //set timeout so that the loading of the game doesn't screw up
    //the css transition...
    setTimeout(()=> {
      this.setState({source_url: this.props.game.source_url})
    }, 1000);

  },

  render() {
    if(this.state.source_url == "") {
      return (<p style={{textAlign: "center"}} >One moment...</p>)
    } else {
    return (
        <iframe style={{height: "100%", width: "100%"}} src={this.state.source_url}></iframe>
        )
    }
  }

})
