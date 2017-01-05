class CommandRouter {

  constructor() {
    this.commands = [];
  }

  run(rawInput) {
   
    var suggestions = this.suggestionsFrom(rawInput);
    if(suggestions.length == 0) {
      throw "Command not found";
    } else if (suggestions.length > 1) {
      throw "Ambiguous command.  Is there more than one command with the same name?"
    }

    suggestions[0].run(new CommandInput(rawInput));
  }

  suggestionsFrom(rawInput) {
    var inp = new CommandInput(rawInput);
    var suggestions = this.commands.filter((c)=>{
      
      var issues = c.issuesWithResolving(inp);
      return !issues.notMatched //filters not matched
    });
    return suggestions;
  }
}

class CommandInput {
  constructor(rawInput) {
    this.raw = rawInput;
    this.parsed = this.parse(this.raw);
  }
  
  parse(rawInput) {
    var ret = {name: null, args: [], opts: {}};
    var components = rawInput.split(" ").filter((s) => s != "");
    //name of the command is first component
    ret.name = components.shift();
    if(ret === undefined) 
      throw "Cannot parse empty string";
    while(components.length > 0) {
      var nextComp = components.shift()
        //it's an opt
      if(nextComp.indexOf("-") == 0) {
        optArg = components.shift();
        ret.opts[nextComp] = optArg;
      } else {
        ret.args.push(nextComp);
      }
    }
    return ret;
  }
}


class Command {
  constructor(name, execute, params, opts) {
    this.name = name;
    this.execute = execute;
    this.params = params || [];
    this.opts = opts || {};
    this.lastInput;
  }

  properUsageInstructions() {
    return this.name + " " + this.params.map((p)=>{
      if(p.optional) {
        return "<" + p.name + " (optional)>";
      } else {
        return "<" + p.name + ">";
      }
    }) 
  }
  
  issuesWithResolving(commandInput) {
    var parsed = commandInput.parsed;
    var inputName = parsed.name;
    var inputArgs = parsed.args.slice();
    var inputOpts = parsed.opts;
     
    if(this.name != inputName) {
      return {notMatched: true}
    }

    var issues = {notMatched: false, params: {}};
    var thisParams = this.params.slice();
    var param;
    while(param = thisParams.shift()) {
      var nextArg = inputArgs.shift();
      if(nextArg === undefined) {
        if(param.optional) {
          return issues;
        } else {
          issues.params[param.name] = "is required";
        }
      } else {
        if(!param.canTake(nextArg)) {
          issues.params[param.name] = "not valid"; 
        }
      }
    }
    return issues;
  }

  paramsObject(argsArr){
    var thisParams = this.params.slice(); 
    var argsCp = argsArr.slice();
    var ret = {}
    var param;
    while(param = thisParams.shift()) {

      var arg = argsCp.shift()
      ret[param.name] = arg;
    }
    return ret;
  }

  run(commandInput) {
    var issues = this.issuesWithResolving(commandInput);
    if(issues.notMatched) 
      throw new CommandRunError("Tried to run command '"+this.name+"' against unmatched command '"+commandInput.parsed.name, {}, this);
    if(Object.keys(issues.params).length > 0) 
      throw new CommandRunError("Tried to run command '"+this.name+"' when issues present", issues.params, this);
    this.lastInput = commandInput;
    this.execute(this.paramsObject(commandInput.parsed.args), commandInput.parsed.opts);
  }
}

class CommandParam {
  constructor(name, validityTest,  optional) {
    this.name = name;
    //everythings valid by default
    var alwaysValid = () => true;
    this.validityTest = validityTest || alwaysValid;
    this.optional = optional;
  }

  canTake(argument) {
    return this.validityTest(argument); 
  }
}

class CommandRunError extends Error {
  constructor(message, issues, command) {
    super(message || "error running command");
    this.issues = issues;
    this.command = command;
  }
}


Command.argumentIsANumber = (arg) => {
  var reg = /^\d+$/;
  return !!(arg.match(reg))
};

Command.argumentIsAString = (arg) => {
  return true;
};


