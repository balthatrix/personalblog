
var IframedGame = React.createClass({

 
  getInitialState() {
    return {};
  },

  componentDidMount() {

  },

  componentDidUpdate(prevProps, prevState) {
  },

  render() {
    return (
        <iframe style={{height: "100%", width: "100%"}} src={this.props.game.source_url}></iframe>
        )
  }

})
