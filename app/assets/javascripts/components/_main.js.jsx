
//asset pipeline is funky for this import
var Console = Console.default;
var Main = React.createClass({

  commandRouter: new CommandRouter(),
 
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
    var newgame = new Command("newgame", this.newGameRoutine);
    
    this.commandRouter.commands.push(login);
    this.commandRouter.commands.push(stop);
    this.commandRouter.commands.push(newgame);

    document.addEventListener("focus", this.focused);
    document.addEventListener("keydown", this.focused);
    document.addEventListener("click", this.focused);
    this.refs.password_form.addEventListener("submit",this.passwordSubmitted);

    this.setInitialLoginState();

    this.freezeAppend("Hi, I'm Jeron.", 100)
      .then(()=>this.freezeFor(1000))
      .then(()=>this.freezeAppend("\nI like to code games.", 100))
      .then(()=>{
        this.setState({ignoringNextNewline: true});
        this.refs.console.acceptLine();
        console.log("HI");
        this.setState({promptLabel: "$ "});
      });

  },

  componentDidUpdate(prevProps, prevState) {
    if(this.state.promptLabel != prevState.promptLabel) {
      this.refs.console.return();
    }
  },

  render() {
    return (
        <div style={this.mainStyle()}>
        <div style={{width: 0, height: 0, overflow: "hidden"}}>
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

    this.refs.console.return();
    return true;
  },

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
          this.allowConsoleInput();
          resolve();
        }
      }
      appendNext(Array.from(str));
    });
  },

  freezeFor(t) {
    this.disallowConsoleInput();
    return new Promise((resolve) =>{
      setTimeout(()=>{
        this.allowConsoleInput();
        resolve();
      }, t);
    });
  },

  disallowConsoleInput() {
    this.refs.nil.value = "";
    this.refs.nil.focus();
    this.setState({inputToNil:true});
  },

  allowConsoleInput() {
    this.refs.console.focus();
    this.setState({inputToNil:false});
  },

  newGameRoutine() {
    if(this.state.credentials) { 
      $.ajax({
        url: `/api/v1/games`,
        type: 'POST',
        data: {game:{title: "hi", description: "some game"}, access_token: this.state.credentials.access_token},

        success: (response) => {
          console.log(response);
        }
      });
    } else {

      this.refs.console.log("You must login to do that");
    }
  },
  
  setInitialLoginState() {
    var creds = this.getPersistentLoginCredentials();
    if(creds) {
      this.setState({credentials: creds});

      
      console.log("creds initially: ", creds);
    } else {
      
      console.log("no credentials detected: ");
    }
  },

 
  onLoginSuccess(response) {
    this.setState({credentials: {access_token: response.access_token, refresh_token: response.refresh_token}}) 
    this.setPersistentLoginCredentials(response);
    this.refs.console.log("Successfully logged in");
  },

  onLoginFailure(response) {
    this.refs.console.logX("error", "Login failure");
  },

  stateHasCredentials() {
    return (this.state.credentials != null)
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

  focused() {
    if(this.state.takingPassword) {
      this.refs.hidden_password.focus();
    } else if (this.state.inputToNil) {
      this.refs.nil.focus();
    } else {
      this.refs.console.focus();
    }
  },


    passwordSubmitted(e) {
    console.log("here!!!")
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
