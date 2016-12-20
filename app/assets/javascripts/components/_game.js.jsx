var Game = React.createClass({ 
  getInitialState() {

    return {editable: false};
  },
  handleEdit() {
    if(this.state.editable) {
      console.log("new values: ", this.refs.title.value,this.refs.description.value);
      var id = this.props.game.id
      var title = this.refs.title.value;
      var description = this.refs.description.value;
      var game = {id: id, title: title, description: description};
      this.props.handleUpdate(game);
    }
    this.setState({editable: !this.state.editable});
  },
  render() { 
    var title = this.state.editable ? 
      <input type='text'  ref='title' defaultValue={this.props.game.title} /> :
      <h3>{this.props.game.title}</h3>
    var description = this.state.editable ?
      <input type='text' ref='description' defaultValue={this.props.game.description} /> :
      <p>{this.props.game.description}</p>
    return (
        <div key={this.props.game.id}>
          {title}
          {description}
	  <button onClick={this.props.delClicked} >Delete</button>
	  <button onClick={this.handleEdit} >{this.state.editable ? "Submit" : "Edit"}</button>
	</div>
       );
  }, 
});
