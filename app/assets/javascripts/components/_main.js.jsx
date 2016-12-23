
//asset pipeline is funky for this import
var Console = Console.default;
var Main = React.createClass({

  mainStyle() {
    return {
      fontFamily: "'Inconsolata', monospace",
      fontSize: 16,
      backgroundColor:"black",
      color: "#00ff00",
      width: "100vw",
      height: "100vh",
    };
  },
  render() {
    var gone = (
        <div>
        <header />
        <body />
        </div>
        );

    //var rows_cp = this.state.rows.slice();
    //last = rows_cp.pop();
    return (
        <div style={this.mainStyle()}>
        <Console  ref="console"
          handler={this.enteredText}
          autofocus={true}/>
        </div>
    )
  },

  enteredText(thing) {
    console.log("thing: ", thing);
    this.refs.console.log(thing);
    this.refs.console.return();
  }
})
