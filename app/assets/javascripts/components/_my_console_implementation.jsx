var MyConsole = React.createClass({

  //TODO: each character is it's own div, to handle spaces.  spaces are divs with a fixed character width.....

  rowStyle() {
    return {
      fontSize:16,
      float:"left",
      fontFamily: "'Inconsolata', monospace",
      cursor: "default",
    }
  },

  characterStyle () {
    return {
      fontSize:16,
      float:"left",
      fontFamily: "'Inconsolata', monospace",
      cursor: "default",
    }
  },

  unitStyle() {
    return {
      fontSize:16,
      position: "absolute",
      top: -100,
      fontFamily: "'Inconsolata', monospace",
    }
  },


  cursorStyle (){
    return {
      cursor: "default",
      fontFamily: "'Inconsolata', monospace",
      fontSize: "21px",
      marginLeft: "1px",
      float:"left",
    }
  },

  spaceStyle () {
    return {
      cursor: "default",
      fontFamily: "'Inconsolata', monospace",
      height: this.state.charHeight,
      width: this.state.charWidth,
      float:"left",
      color: "black",
    }
  },




  spaceDiv() {
    return <div key={this.token()} style={this.spaceStyle()}> </div>
  },

  token() {
        return Math.random().toString(36).substr(2); // remove `0.`
  },

  characterDiv(str) {
    if(str == " ") {
      return this.spaceDiv();
      console.log("space!", this.state)
    } else {
      return <div key={this.token()} style={this.characterStyle()}>{str}</div>
    }
  },
 

  bufferElementsFromString(str, notEditable){
    return Array.from(str).map((c)=>{
      return {characterDiv: this.characterDiv(c), editable: !notEditable}
    });
  },

  appendToBuffer(str) {
    var newBuffer = this.state.buffer.concat(this.bufferElementsFromString(str));
    this.setState({buffer: newBuffer});
  },

  getInitialState() {
    return {
      buffer: [],
      charWidth: 8,
      charHeight: 18,
      consoleWidth: 65,
      shiftIsDown: false,
    }
  },

  mainWidth() {
    console.log("width: ", this.state.charWidth * this.state.consoleWidth);
    return this.state.charWidth * this.state.consoleWidth;
  },

  lastRow() {
    return this.state.rows[this.state.rows.length - 1];
  },

  bufferComps() {
    return this.state.buffer.map((be)=> be.characterDiv);
  },

  render() {
    var gone = (
        <div>
        <Header />
        <Body />
        </div>
        );

    //var rows_cp = this.state.rows.slice();
    //last = rows_cp.pop();
    return (
      <div style={{width: this.mainWidth()}}> 
        <span id="monospace_unit" style={this.unitStyle()}>x</span>
        {this.bufferComps()}
        <div style={{clear: "both"}}></div>
      </div>
    )
  },

  outputChar(char) {
    console.log("outpusing ", char);
    return <div style={{float:"left"}}>{char == " " ? this.space() : char}</div>
  },

  keyUp(e) {
    console.log("up: ", e.which);
  },

  keyDown(e) {
    console.log("down: ", e.which);
    var character = String.fromCharCode(e.which)

    console.log("from code: ", character);

    if(character.match(/^[a-z0-9]+$/i) || character == " "){
      if(!this.state.shiftIsDown)
        character = character.toLowerCase();
      this.appendCharacter(character);
    }


  },


  newRow() {

  },

  shiftUp() {
    this.setState({shiftIsDown: false});
  },

  shiftDown() {
    this.setState({shiftIsDown: true});
  },

  appendCharacter(character) {
    /*
    var lr = this.lastRow();
    lr.buffer += character;
    var oldRows = this.state.rows.slice();
    oldRows.pop();
    this.setState({rows: oldRows.concat(lr)})
    */
  },




  cursor() {
    return "❚"
  },

  space() {
    return "❚"
  },


  componentDidMount() {
    var u = document.getElementById("monospace_unit");
    console.log("mounted: ", u.offsetWidth, u.offsetHeight);
    
    this.setState({charWidth: u.offsetWidth, charHeight:u.offsetHeight});


    document.onkeydown = (this.keyDown);
    document.onkeyup = (this.keyUp);
    window.onfocus = (this.shiftUp);
    this.appendToBuffer("hellow world!")
  },

})
