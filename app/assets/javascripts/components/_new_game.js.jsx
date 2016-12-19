var NewGame = React.createClass({ 
  render() { 
    return ( 
      <div>
        <input ref='title' placeholder='Enter the title of the game' /> 
        <input ref='description' placeholder='Enter a description' /> 
        <button onClick={this.handleClick} >Submit</button> 
      </div>
   ) 
  },

  handleClick() { 
    var title = this.refs.title.value; 
    var description = this.refs.description.value; 
    $.ajax({
      url: "/api/v1/games",
      type: "POST",
      data: {game: {title: title, description: description}},
      success: (response) => {
        if(this.props.onNewSuccess)
          this.props.onNewSuccess(response);
      }
    }) 
  },
});

