angular.module('centauriApp.controllers', [])


.controller('TabsCtrl', function($scope, AuthenticationService, firebase, $state, $ionicModal, $ionicPopup, $ionicHistory) {

  // Create registration modal.
  $ionicModal.fromTemplateUrl('templates/registration-modal.html', {
    scope: $scope
  }).then(function(registrationModal) {
    $scope.registrationModal = registrationModal;
  });

  function initializeRegistrationData() {
    /* Initializes an object of registration data called regData with empty strings as the values for all attributes.. */
    var regData = {
      email: "",
      password1: "",
      password2: "",
    };
    return regData;
  }

  $scope.showRegistrationModal = function() {
    /* Opens the modal to register a user. */
    $scope.regData = initializeRegistrationData();
    $scope.registrationModal.show(); // Open modal
  };

  $scope.closeRegistrationModal = function() {
    /* Closes the modal to register a user. */
    $scope.registrationModal.hide(); // Close modal
  };

  function showErrorAlert(message) {
    /* Takes a message and shows the message in an error alert popup. */
    var alertPopup = $ionicPopup.alert({
      title: "Error",
      template: message,
      okType: 'button-balanced'
    });
     // Popup goes away automatically when OK button is clicked.
  }

  function validateUserInfo(regData) {
    /* Takes user inputted data and performs client side validation to determine if it is valid.
    Displays an error alert if neccesary. Returns a boolean for if data inputted is valid. */

    if (regData.password1 !== regData.password2) {
      showErrorAlert("Please make sure passwords match.");
      return false;
    } else if (regData.email.length <= 0 || regData.password1.length <= 0) {
      showErrorAlert("Please fill out all required fields.");
      return false;
    }
    return true;
  }

  function validateLoginInfo(loginData) {
    /* Takes user inputted login data and performs client side validation to determine if it is valid.
    Displays an error alert if neccesary. Returns a boolean for if data inputted is valid. */

    if (!(loginData.loginEmail && loginData.loginPassword)) { // If either are not defined.
      showErrorAlert("Please Fill Out Required Fields.");
      return false;
    }
    return true;
  }

  function clearHistoryAndCache() {
    /* Clears the view cache and history.
    Called when user logs in and logs out so data from a past user is never shown to new users. */
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
  }

  $scope.register = function() {
    /* Calls AuthenticationService method to register new user. Sends error alert if neccessary. */
    if (validateUserInfo($scope.regData)) {
      clearHistoryAndCache();
      AuthenticationService.registerNewUser($scope.regData)
      .then(function() {
         $scope.closeRegistrationModal();
       }).catch(function(errorMessage) {
         showErrorAlert(errorMessage);
       });
    }
  };

  $scope.loginData = {}; // Initialize object for login data to be stored in.

  $scope.login = function() {
    /* Calls AuthenticationService method to sign user in. Sends error alert if neccessary. */
    if (validateLoginInfo($scope.loginData)) {
      clearHistoryAndCache();
      AuthenticationService.signIn($scope.loginData.loginEmail, $scope.loginData.loginPassword)
      .catch(function(errorMessage) {
        showErrorAlert(errorMessage);
      });
    }
  };

  $scope.logout = function() {
    /* Calls AuthenticationService method to sign user out. Sends error alert if neccessary. */
    clearHistoryAndCache();
    AuthenticationService.signOut()
    .catch(function(errorMessage) {
      showErrorAlert(errorMessage);
    });
  };

  firebase.auth().onAuthStateChanged(function(user) {
    /*  Tracks user authentication status using observer and reroutes user if neccessary. */
    if (user) {
      // User is signed in.
      $state.go('tab.feed');
    } else {
      // No user is signed in.
      $state.go('login');
    }
  });




})

.controller('FeedCtrl', function($scope, ResearchService, AccountService, AuthenticationService) {

  $scope.curPaperID = 0;

  $scope.curPaper = function() {
    return $scope.paperObjects[$scope.curPaperID];
  }

  $scope.curID = function() {
    return $scope.curPaperID;
  }

  $scope.onIgnore = function() {
    $scope.curPaperID++;
    
  }
  $scope.onSave = function() {
    $scope.curPaperID++;
  }


  function filterPapers(paperObjects, userPrefTags, savedPapersIDs, ignoredPaperIDs) {

    var filteredPapers;

    if (userPrefTags.length === 0) {
      filteredPapers = paperObjects;
    } else {
      filteredPapers = [];
      for (var i = 0; i < paperObjects.length; i++) {
        var paper = paperObjects[i];
        for (var j = 0; j < userPrefTags.length; j++) {

          if (paper.tags[userPrefTags[j]] === 1) {
            filteredPapers.push(paperObjects[i].id);
            break;
          }
        }
      }
    }

    var filteredPapersUnseen = [];

    for (var k = 0; k < filteredPapers.length; k++) {

        if (savedPapersIDs.indexOf(filteredPapers[k]) == -1 && ignoredPaperIDs.indexOf(filteredPapers[k]) == -1) {
          filteredPapersUnseen.push(filteredPapers[k]);
        }
    }
    return filteredPapersUnseen;
  }


  var currentUserID = AuthenticationService.getCurrentUserID();
  var paperObjects = ResearchService.getResearchExamples();
  var userPref = AccountService.getExplorerGenreTags(currentUserID);
  var papersSeen = AccountService.getExplorerPapersSeenIDs(currentUserID);


  setTimeout(function() {

    var ignoredPaperIDs = papersSeen[0];
    var savedPapersIDs = papersSeen[1];
    var userPrefTags = userPref[0];

    $scope.paperObjects = filterPapers(paperObjects, userPrefTags, savedPapersIDs, ignoredPaperIDs);

  }, 1000);



})


.controller('PortfolioCtrl', function($scope) {

})



.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});



// .filter('filterPapers', function($filter) {
//     /* Takes a time in seconds and converts it to a string represetation of the time. */
//     return function(papers, tagsFilterArray) {
//
//       var filteredPapers;
//
//       if (tagsFilterArray.length === 0) {
//         filteredPapers = papers;
//       } else {
//         filteredPapers = [];
//         for (var i = 0; i < papers.length; i++) {
//           var paper = papers[i];
//           for (var j = 0; j < tagsFilterArray.length; j++) {
//
//             var tag = tagsFilterArray.value;
//             console.log(tag);
//             if (paper.tags[tagsFilterArray[i]] === 1) {
//               filteredPapers.push(paper);
//               break;
//             }
//           }
//         }
//       }
//       // return filteredPapers;
//       return papers;
//     };
// });
