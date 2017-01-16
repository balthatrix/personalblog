
//asset pipeline is funky for this import
var Console = Console.default;
var Main = React.createClass({

  commandRouter: new CommandRouter(),
 
  //focus modalities: inputToNil || password ||  
  getInitialState() {
    return {
      windowOpen: false,
      closableWindowContents: null,
      closableWindowTitle: "",
      takingInput: false,
      takingPassword: false,
      promptLabel: "",
      inputToNil: false,
      ignoringNextNewline: false,
    }
  },

  componentDidMount() {
    window["mainApp"] = this;
    var login = new Command("login", this.loginRoutine);
    var stop = new Command("stop", this.disallowConsoleInput);
    var newgame = new Command("newgame", this.newGameRoutine);
    var list = new Command("list", this.listRoutine, [new CommandParam("resourceName")]);
    var play = new Command("play", this.playRoutine, [new CommandParam("slug")]);
    

    this.commandRouter.commands.push(login);
    this.commandRouter.commands.push(stop);
    this.commandRouter.commands.push(newgame);
    this.commandRouter.commands.push(list);
    this.commandRouter.commands.push(play);


    document.addEventListener("focus", this.focused);
    document.addEventListener("keydown", this.focused);
    document.addEventListener("click", this.focused);
    this.refs.password_form.addEventListener("submit",this.passwordSubmitted);

  /*
    this.freezeAppend("Hi, I'm Jeron.", 100)
      .then(()=>this.freezeFor(1000))
      .then(()=>this.freezeAppend("\nI like to code games.", 100))
      .then(()=>{
      });
*/

    //    this.setState({ignoringNextNewline: true});
    //    this.refs.console.acceptLine();
        this.setState({promptLabel: "$ "});

  },

  componentDidUpdate(prevProps, prevState) {
    if(this.state.promptLabel != prevState.promptLabel) {
      this.refs.console.return();
    }
  },

  render() {
    var closableClass = "closable-window";
    if(this.state.windowOpen) {
      closableClass += " window-open";
    }

    return (
        <div style={this.mainStyle()}>
        <div style={{width: 0, height: 0, overflow: "hidden"}}>
          <form ref="password_form">
            <input onChange={this.passwordFieldChanged} type="password" ref="hidden_password" />
          </form>
          <input ref="nil" />
        </div> 
        <ClosableWindow title={this.state.closableWindowTitle} onHandleClose={this.closeWindow} className={closableClass}>
	  {this.state.closableWindowContents}
	</ClosableWindow>
        <Console  ref="console"
          handler={this.consoleHandler}
          promptLabel={this.state.promptLabel}
          autofocus={true}
	  />
        </div>
    )
  },


  resourceTypeOutput(resourceType, resource)  {
    switch(resourceType) {
      case "games":
        this.refs.console.logX("title", this.capitalize(resource.title));
        this.refs.console.log(resource.description);
        this.refs.console.log("enter 'play " + resource.id + "' or 'play "+ resource.title.toLowerCase().replace(/\s/g, "-") +"' to try it out.");
        this.refs.console.logX("title", "-----");
        break;
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
        this.handleCommandError(err);
        console.log("err: ",err);
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
    var creds = this.loginCredentials();
    this.tryCredAjax({
      url: `/api/v1/games`,
      type: 'POST',
      data: {game:{title: "Asteroid Hunter", description: "A game where you kill asterds"}},
    })
    .then((r)=>this.refs.console.log("Successfully created new game"),
        (r)=>console.log("rej: ", r))
  },

  handleCommandError(commandRunError) {
    console.log("err: ", commandRunError)
      try {
        var issues = commandRunError.issues;
        var msg = commandRunError.message;
        var command = commandRunError.command;
        var issueMessage = "";
        for(var issueKey in issues) {
          issueMessage += issueKey + ": " + issues[issueKey] + ". ";
        }

        console.log("comamnd: ", command);
        var usage  = command.properUsageInstructions();
        this.refs.console.logX("error", msg + ". " +  issueMessage);
        this.refs.console.log("Proper usage: " + usage); 
    } catch (error) {
      this.refs.console.logX("error", commandRunError);
    }
  },

  listRoutine(args) {
    var resourceName = args.resourceName;
    this.tryCredAjax({
      url: "/api/v1/"+resourceName + ".json",
    }).then((r) => {
      if(r.length > 0) {
        for(var res of r) {
          this.resourceTypeOutput(resourceName, res);
        }
      }
    });
  },

  playRoutine(args) {
    var gameSlug = args.slug;
    this.tryCredAjax({
      url: "/api/v1/games/"+gameSlug+ ".json",
    }).then((g) => {
      this.refs.console.log("Launching " + (g.title) + "...");

      setTimeout(()=>{
      this.setState({windowOpen: true, closableWindowContents: (<IframedGame game={g} />), closableWindowTitle: g.title});
      },1000)
     
    });
  },



  capitalize(str) {
    var ret = str.split(" ");
    return ret.map((word) => {
      var w = word;
      return w[0].toUpperCase() + w.slice(1, w.length);
    }).join(" ");
  },

  tryCredAjax(opts) {
    var url = opts.url;
    var type = opts.type || "GET";
    var data = opts.data || {};
    return new Promise((resolve, reject)=>{
      if(this.isLoggedIn()){
        try {
          data.access_token = this.loginCredentials().access_token;
        } catch (e){
          console.log("credentials not here");
        }
        $.ajax({
          url: url,
          type: type,
          data: data,
          success: resolve,
          error: (res) => {
            if(res.status == 401) { 
              this.refs.console.logX("error", "Error, credentials expired.  You need to login again.  Try 'login'");
            }
            reject(res);
          }
        });
      } else {
        this.refs.console.log("You must login to do this");
        reject("Login required");
      }
    })
  },

  onLoginSuccess(response) {
    this.setPersistentLoginCredentials(response);
    this.refs.console.log("Successfully logged in");
  },

  onLoginFailure(response) {
    this.refs.console.logX("error", "Login failure");
  },


  isLoggedIn() {
    return (this.loginCredentials() != undefined);
  },

  setPersistentLoginCredentials(response){
    var access_token = response.access_token;
    var refresh_token = response.refresh_token;
    var expires_in = response.expires_in;
    localStorage.setItem("credentials", JSON.stringify({
      expires_in: expires_in,
      access_token: access_token, 
      refresh_token: refresh_token
    }));
  },

  loginCredentials(){
    var creds = localStorage.getItem("credentials");
    if(creds) {
      try {
        creds = JSON.parse(creds);
      } catch (err) {
        console.log("error parsing the credentials: ", err);
        return undefined 
      }
    }
    return creds;
  },

  focused() {
    if(this.state.windowOpen) {
      return;
    }
    if(this.state.takingPassword) {
      this.refs.hidden_password.focus();
    } else if (this.state.inputToNil) {
      this.refs.nil.focus();
    } else {
      this.refs.console.focus();
    }
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
  },

  closeWindow() {
    this.setState({windowOpen:false, closableWindowTitle: "", closableWindowContents: null})
  }

})
