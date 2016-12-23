var Main = React.createClass({
  getInitialState() {
    return {
      buffer: [],
      charWidth: 8,
      charHeight: 18,
      consoleWidth: 65,
      shiftIsDown: false,
    }
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
        <div></div>
    )
  },

})
