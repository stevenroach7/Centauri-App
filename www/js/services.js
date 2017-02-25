var servMod = angular.module('centauriApp.services', []); // Assigning the module to a variable makes it easy to add new factories.


servMod.factory('AuthenticationService', function(firebase, $q) {
  /* Contains methods to handle user authentication. */

  var getSignInErrorMessage = function(errorCode) {
    /* Takes an signIn errorCode and returns a message to later be displayed to the user. */
    if (errorCode) {
      switch(errorCode) {
        case "auth/invalid-email":
          return "Invalid Email Password Combination";
        case "auth/user-disabled":
          return "Sorry. Your account has been disabled.";
        case "auth/user-not-found":
          return "Invalid Email Password Combination";
        case "auth/wrong-password":
          return "Invalid Email Password Combination";
        default:
          return "Invalid Login Information.";
      }
    }
    return "Invalid Login Information";
  };

  var getRegistrationErrorMessage = function(errorCode) {
    /* Takes a registration errorCode and returns a message to later be displayed to the user. */
    if (errorCode) {
      switch(errorCode) {
        case "auth/email-already-in-use":
          return "This email address is taken.";
        case "auth/invalid-email":
          return "Please enter a valid email address.";
        case "auth/operation-not-allowed":
          return "Server Error. Please Try Again.";
        case "auth/weak-password":
          return "You password must contain at least 6 characters.";
        default:
          return "Server Error. Please Try Again.";
      }
    }
    return "Server Error. Please Try Again.";
  };

  return {

    getCurrentUserID: function() {
      /* Returns the userID of the current user, null if no user is signed in. */
      var user = firebase.auth().currentUser;
      if (user) {
        // User is signed in.
        return user.uid;
      } else {
        // No user is signed in.
        return null;
      }
    },

    registerNewUser: function(regData) {
      /* Takes an object of registration data and registers a new user in the firebase authentication service
      and in the users object in the firebase database. */

      var deferred = $q.defer(); // Create deferred promise.

      // Add user to firebase authentication provider.
      firebase.auth().createUserWithEmailAndPassword(regData.email, regData.password1) // This can fail so chain promise to catch error at the end.
      .then(function(user) {

        // Add user to firebase DB.
        var newUserInfo = {
          email: regData.email
        };

        // Get firebase unique authentication id of user so we can use as key in our users Object.
        var newUserID = user.uid;

        // Get reference to firebase users table so we can add a new user.
        var usersRef = firebase.database().ref().child("explorers");

        // Add new user to users object with key being the userID specified by the firebase authentication provider.
        return usersRef.child(newUserID).set(newUserInfo);
      })
      .then(function(ref) {
        deferred.resolve(); // success, resolve promise.
      })
      .catch(function(error) {
        // TODO: Consider if it is a problem that the user could be not added to db object but be in authentication users.
        var errorMessage = getRegistrationErrorMessage(error.code);
        deferred.reject(errorMessage);
      });
      return deferred.promise;
    },

    signIn: function(email, password) {
      /* Takes an email and a password and attempts to authenticate this user and sign them in. */

      var deferred = $q.defer(); // deferred promise.
      firebase.auth().signInWithEmailAndPassword(email, password)
      .then(function() {
        // SignIn successful. Send resolved promise.
        deferred.resolve();
      }).catch(function(error) {
        var errorMessage = getSignInErrorMessage(error.code);
        deferred.reject(errorMessage);
      });
      return deferred.promise;
    },

    signOut: function() {
      /* Uses the firebase authentication method to sign the user out. */

      var deferred = $q.defer(); // deferred promise.
      firebase.auth().signOut().then(function() {
        // SignOut successful. Send resolved promise.
        deferred.resolve();
      }).catch(function(error) {
        // signOut Failed. Send rejected promise.
        deferred.reject("Please Try Again.");
      });
      return deferred.promise;
    }
  };

});



servMod.factory('ResearchService', function($firebaseArray, $q) {
  /* Contains methods to get research data */


  var researchExamples = [
    {
      title: "Neural Network",
      author: "Terence Tao",
      description: "Fancy Math",
      journal: "",
      imageUrl: "../img/neural-network.png"
    },
    {
      title: "Vitamin C and Colds",
      author: "Hemilä H",
      description: "Science!",
      journal: "",
      imageUrl: "../img/perry.png"
    }
  ];



  return {

    getResearchData: function(index) {
      /* Returns a fake example of a research paper description. */
      return researchExamples[index];
    },


    getResearchExamples: function() {
      /* Queries the firebaseDB to return an array of papers
       to display in the feed. */

      // Get array of research papers.
      var papersRef = firebase.database().ref().child("research-examples");
      var papers = $firebaseArray(papersRef);

      return papers;
    },


    getResearchExample: function(exampleID) {
      /* Takes the id of a research example and returns an object representing that example.*/
      var deferred = $q.defer();

      var exampleRef = firebase.database().ref().child("research-examples").child(exampleID);
      var researchExample = $firebaseObject(exampleRef);
      researchExample.$loaded()
      .then(function() {
        deferred.resolve(researchExample);
      })
      .catch(function(error) {
        deferred.reject();
      });
      return deferred.promise;
    }

  };


});


servMod.factory('RequestService', function($firebaseArray, $q) {



  return {
    addRequest: function(requestData) {
        /* Takes a requestData object and adds it to the firebase DB into the games object. */

        var deferred = $q.defer(); // deferred promise.

        var requestRef = firebase.database().ref().child("requests");
        var requests = $firebaseArray(requestRef);

        requests.$add(requestData)
        .then(function(ref) {
          deferred.resolve();
        })
        .catch(function(error) {
          deferred.reject("Please try again.");
        });

      return deferred.promise;
    }

  };


});




servMod.factory('AccountService', function($firebaseObject, $firebaseArray, $q) {
    /* Contains methods used to access account data. */

    return {

      getExplorer: function(explorerID) {
        /* Takes a userID and returns the user object in the firebase DB for that id. */
        var deferred = $q.defer();

        var explorerRef = firebase.database().ref().child("explorers").child(explorerID);
        var explorer = $firebaseObject(explorerRef);
        explorer.$loaded()
        .then(function() {
          deferred.resolve(explorer);
        })
        .catch(function(error) {
          deferred.reject();
        });
      return deferred.promise;
    },

    getExplorerGenreTags: function(explorerID) {
      /* Takes an explorerID and returns an array of their genre preferences. */

     // Get array of research papers.
     var genresRef = firebase.database().ref().child("explorers").child(explorerID).child("preferences");
     var genres = $firebaseArray(genresRef);

     return genres;

   },

   getExplorerPapersSeenIDs: function(explorerID) {
     /* Takes an explorerID and returns an array with the id's of their saved papers. */

    // Get array of research papers.
    var papersSeenRef = firebase.database().ref().child("explorers").child(explorerID).child("papers-seen");
    var papersSeen = $firebaseArray(papersSeenRef);

    return papersSeen;
  },


    };
  });
