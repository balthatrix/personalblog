
//asset pipeline is funky for this import
var Console = Console.default;
var Main = React.createClass({

  commandRouter: new CommandRouter(),

  loginRoutine() {
    this.takeInput("Email: ")
      .then((email)=>{
        this.takePassword("Password: ").then((pw)=>{
          $.ajax({
            method: "POST", 
            url: "/oauth/token", 
            data: {grant_type: "password", email: email, password: pw}, 
            success: this.onLoginSuccess,
            error: this.onLoginFailure,
          })
          
        });
      });
  },

  appendToConsole(str) {
    var existingLine = this.refs.console.state.promptText;
    var existingPoint = this.refs.console.state.point;
    console.log("existion: ", existingLine);
    this.refs.console.setState({promptText: existingLine + str, point: existingPoint + str.length});
  },

  freezeAppend(str, chTime) {
    this.disallowConsoleInput();
    return new Promise((resolve) =>{
      var appendNext = (chArr) =>  {

        var nextCh = chArr.shift();
        
        if(nextCh) {
          this.appendToConsole(nextCh);
          setTimeout(()=>appendNext(chArr), chTime);
        } else {
          console.log("going to all");
          this.allowConsoleInput();
          resolve();
        }
      }
      appendNext(Array.from(str));
    });
  },

  disallowConsoleInput() {
    console.log("stoping!")
    this.refs.nil.value = "";
    this.refs.nil.focus();
    this.setState({inputToNil:true});
  },

  allowConsoleInput() {
    console.log("starting!")
    this.refs.console.focus();
    this.setState({inputToNil:false});
  },

  newGameRoutine() {
    $.ajax({
      url: `/api/v1/games`,
      type: 'POST',
      data: {game:{title: "hi", description: "some game"}, access_token: "484ba8d1d458e3d2f04abba15378b8e70ed6b65e784c75c5d0e79897a772a1c6"},
       
      success: (response) => {
        console.log(response);
      }
    });
  },
  
  setPersistentLoginCredentials(response){
    var access_token = response.access_token;
    var refresh_token = response.refresh_token;
    localStorage.setItem("credentials", JSON.stringify({access_token: access_token, refresh_token: refresh_token}));
  },

  getPersistentLoginCredentials(response){
    var creds = localStorage.getItem("credentials");
    if(creds) {
      try {
        creds = JSON.parse(creds);
      } catch (err) {
        return null
      }
    }
    return creds;
  },
  
  onLoginSuccess(response) {
    console.log("response: ", response);
    this.setState({credentials: {access_token: response.access_token, refresh_token: response.refresh_token}}) 
    this.setPersistentLoginCredentials(response);
    this.refs.console.log("Successfully logged in");
  },

  onLoginFailure(response) {
    this.refs.console.logX("error", "Login failure");
  },

  alreadyLoggedIn() {
     
  },

  getInitialState() {
    return {
      takingInput: false,
      takingPassword: false,
      promptLabel: "",
      credentials: null,
      inputToNil: false,
      ignoringNextNewline: false,
    }
  },

  componentDidMount() {
    window["mainApp"] = this;
    var login = new Command("login", this.loginRoutine);
    var stop = new Command("stopallinput", this.disallowConsoleInput);
    
    this.commandRouter.commands.push(login);
    this.commandRouter.commands.push(stop);
    document.addEventListener("focus", this.focused);
    document.addEventListener("keydown", this.focused);
    document.addEventListener("click", this.focused);
    this.refs.password_form.addEventListener("submit", this.passwordSubmitted);


    var exampleIntro = "Hi, I'm Jeron.  I like to code";
    this.freezeAppend(exampleIntro, 100).then(()=>{
      this.setState({ignoringNextNewline: true});
      this.refs.console.acceptLine();
      this.setState({promptLabel: "$ "});
    });
  },

  focused() {
    if(this.state.takingPassword) {
      this.refs.hidden_password.focus();
    } else if (this.state.inputToNil) {
      this.refs.nil.focus();
    } else {
      this.refs.console.focus();
    }
  },

  render() {
    return (
        <div style={this.mainStyle()}>
        <div style={{width: 0, overflow: "hidden"}}>
          <form ref="password_form">
            <input onChange={this.passwordFieldChanged} type="password" ref="hidden_password" />
          </form>
          <input ref="nil" />
        </div> 
        <Console  ref="console"
          handler={this.consoleHandler}
          promptLabel={this.state.promptLabel}
          autofocus={true}
	  />
        </div>
    )
  },

  componentDidUpdate(prevProps, prevState) {
    if(this.state.promptLabel != prevState.promptLabel) {
      this.refs.console.return();
    }
  },


  consoleHandler(text) {
    if(text.replace(/\s/, "") == "") { 
      //do nothing
    } else if (this.state.ignoringNextNewline){
      this.setState({ignoringNextNewline: false});
    } else if(this.state.takingPassword) {
      this.state.inputResolve(this.refs.hidden_password.value);
      this.stopTakingInput();
      this.refs.hidden_password.value = "";
      this.refs.console.focus();
    } else if(this.state.takingInput){
      this.state.inputResolve(text);
      this.stopTakingInput();
    } else {
      try {
        this.commandRouter.run(text);
      } catch (err) {
        console.log("err: ",err);
        this.refs.console.logX("error", err);
      }
    }
    
    //this.refs.console.log(text);
    this.refs.console.return();
    return true;
  },


  passwordSubmitted(e) {
    e.preventDefault();
    if(this.state.takingPassword) {
      this.refs.console.acceptLine();
    }
  },

  passwordFieldChanged(e) {
    if(this.state.takingPassword) {
      var pwStars = Array.from(this.refs.hidden_password.value)
        .map(()=>"*").join("");
      this.refs.console.setState({
        promptText:pwStars, 
        point: pwStars.length
      });
    }
  },


  stopTakingInput() {
      this.setState({
        takingInput: false, 
        takingPassword: false, 
        inputResolve: null,
        promptLabel: "$ "
      });
  },

  takeInput(strPrompt) {
    return new Promise((resolve, reject) => {
      this.setState({
        takingInput: true,
        promptLabel: strPrompt,
        inputResolve: resolve
      });
    });
  },

  takePassword(strPrompt) {
    this.refs.hidden_password.focus();
    return new Promise((resolve, reject) => {
      this.setState({
        takingInput: true,
        promptLabel: strPrompt,
        takingPassword: true,
        inputResolve: resolve
      });
    });
  },


  mainStyle() {
    return {
      fontFamily: "'Inconsolata', monospace",
      fontSize: 16,
      backgroundColor:"black",
      color: "#00ff00",
      width: "100vw",
      height: "100vh",
    };
  }


})
