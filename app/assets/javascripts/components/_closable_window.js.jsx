var ClosableWindow  = React.createClass({

 
  getInitialState() {
    return {};
  },

  componentDidMount() {
  
  },

  componentDidUpdate(prevProps, prevState) {
  },

  render() {
    return (
	<div className={this.props.className} style={Object.assign({}, { zIndex: 100, backgroundColor: "grey"}, this.props.style)}>

	  <div style={{width:"calc(100% - 4px)", padding:2,  backgroundColor: "blue"}}>

	    <p style={{textAlign: "center", width:"calc(100% - 40px)", float: "left",margin: "2px 0 0 0"}}> Title </p>
	    <button onClick={()=>this.props.onHandleClose()} style={{borderRadius: 1,  float: "right"}}>X</button>
	    <div style={{clear: "both"}}></div>
	  </div>
	  {this.props.children}
	</div> 
	)
  },



})
