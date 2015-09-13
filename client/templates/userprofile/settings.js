var isEmail = function(email) {
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
};

Template.profileSettings.rendered = function() {
  $("#language").find("option[value=" + Meteor.user().language + "]").attr("selected", "selected");
  $("#gender").find("option[value=" + Meteor.user().gender + "]").attr("selected", "selected");
  Session.set("basicsuccess", "");
  Session.set("passwordsuccess", "");
  $("#biography").val(Meteor.user().biography);
};

Template.profileSettings.helpers({
  //TODO: fetch current profile
  'profile': function() {
    return Meteor.users.findOne({'id':this._id });
  },
  'usermail': function() {
    return Meteor.user().emails[0].address;
  },
  'realerror': function() {
    return Session.get("realerror");
  },
  'usererror': function() {
    return Session.get("usererror");
  },
  'emailerror': function() {
    return Session.get("emailerror");
  },
  'basicsuccess': function() {
    return Session.get("basicsuccess");
  },
  'passwordsuccess': function() {
    return Session.get("passwordsuccess");
  },

  'perrors': function() {
    return Session.get("perrors");
  },

  'langs': function () {
    return data = ["English", "Finnish", "German", "Persian", "Russian", "Swedish"];
  }
});

Template.profileSettings.events({

  'change #realName': function(event,template) {
    if(template.find("#realName").value)
    {
      Session.set("realerror", "");
    }
    else
    {
      Session.set("realerror", "Your Realname is empty!");
    }
    setTimeout(function() {
      $('.username_errors').text("");
    }, 5000);
  },
  'change #userName': function(event,template) {
    var username = template.find("#userName").value;
    if(username)
    {

      if(username === Meteor.user().username)
      {
        Session.set("usererror", "");
      }
      else
      {

        Meteor.call('checkUsername', username, function(error)
        {
          if(error){
            Session.set("usererror", "Username taken already");
          }
          else
          {
            Session.set("usererror", "");
          }
        });

      }
    }
    else
    {
      Session.set("usererror", "Your username is empty!");
    }

    setTimeout(function() {
      $('.username_errors').text("");
    }, 5000);
  },
  'change #email': function(event,template) {
    if(template.find("#email").value)
    {
      Session.set("emailerror", "");
      if(!(isEmail(template.find("#email".value))))
      {
        Session.set("emailerror", "You have not entered a correct Email!");
      }
      else
      {
        Session.set("emailerror", "");
      }
    }
    else
    {
      Session.set("emailerror", "Your Email is empty!");
    }
    setTimeout(function() {
      $('.username_errors').text("");
    }, 5000);

  },

  'click #saveChanges': function(event, template) {
    // realname is for later use
    //var realname = template.find("#realName").value;

    var username = template.find("#userName").value;
    var gender = template.find("#gender option:selected").value;
    var language = template.find("#language option:selected").value;
    var biography = template.find("#biography").value;
    var email = template.find("#email").value;
    if (biography.length > 300)
    {
      $("#bio-error").text("You may not have more than 300 Characters in your Biography");
    }
    else
    {
      $("#bio-error").text("");
      if (Meteor.userId())
      {
        var nachricht = Session.get("usererror");
        if (username && gender && language && email && isEmail(email) && (!(nachricht) || username == Meteor.user().username))
        {
          Session.set("basicsuccess", "Data successfully changed!");
          // setTimeout(Session.set("basicsuccess", ""),5000);

          //TODO simplify
          // later use: Meteor.call("User.update", Meteor.userId(),"realname", realname);
          Meteor.call("User.update", Meteor.userId(),"username", username);
          Meteor.call("User.update", Meteor.userId(),"gender", gender);
          Meteor.call("User.update", Meteor.userId(),"email", email);
          Meteor.call("User.update", Meteor.userId(),"language", language);
          Meteor.call("User.update", Meteor.userId(),"biography", biography);

        }

      }
    }

    //Session.set("errors", "");
    // Meteor.call("User.update", Meteor.userId(),"realname", realname);

    setTimeout(function() {
      $('.username_errors').text("");
    }, 5000);

  },
  'click #saveChangesPassword': function(event,template) {
    event.preventDefault();
    var oldpassword = template.find("#oldPassword").value;
    var password = template.find("#newPassword").value;
    var passwordagain = template.find("#newPasswordCheck").value;
    if ((password === passwordagain)) {
      if (Meteor.userId()) {
        Accounts.changePassword(oldpassword,password, function(error) {
          if(error) {
            if(error.reason === "Match failed")
            {
              Session.set("perrors", "Your old password is empty!");
            }
            else if(error.reason === "Incorrect password")
            {
              Session.set("perrors", "Your old Password is incorrect!");
            }
            else
            {
              Session.set("perrors", error.reason);
            }


          }
          else
          {
            Session.set("perrors", "");
            Session.set("passwordsuccess","Password changed!");
          }
        });
      }
    }
    else
    {
      Session.set("perrors", "Your passwords do not match.")
    }
    setTimeout(function() {
      $('.password_errors').text("");
    }, 5000);
  },

  'keyup #biography': function() {
    var postLength = $("#biography").val().length;
    var charactersLeft = 300 - postLength;
    $('#bioCharactersLeft').text(charactersLeft + " characters left");
  }




});
