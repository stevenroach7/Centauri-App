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

.controller('FeedCtrl', function($scope, $ionicSlideBoxDelegate, ResearchService, AccountService, AuthenticationService) {


  $scope.useCases = [

    ["/img/uc1s1.png", "/img/uc1s2.png", "/img/uc1s3.png"],
    ["/img/uc2s1.png", "/img/uc2s2.png", "/img/uc2s3.png"],
    ["/img/uc3s1.png", "/img/uc3s2.png", "/img/uc3s3.png"],
    ["/img/uc4s1.png", "/img/uc3s2.png", "/img/uc3s3.png"]
  ];

  $scope.feedIndex = 0;

  $scope.onIgnore = function() {
    $scope.feedIndex++;
    $ionicSlideBoxDelegate.update();
    $ionicSlideBoxDelegate.slide(0);
  };
  $scope.onSave = function() {
    $scope.feedIndex++;
    $ionicSlideBoxDelegate.update();
    $ionicSlideBoxDelegate.slide(0);
  };

})


.controller('PortfolioCtrl', function($scope, $ionicPopup) {

  $scope.folders = [ "Chemistry", "Computer Science", "Neuroscience", "Physics", "Biology"];

  $scope.newfolder = function() {
    /* Takes a user and displays the edit profile popup for that user. */

    $scope.data = {}; // object to be used in popup.
    $scope.data.name = "";

    var createFolderPopup = $ionicPopup.show({
      template: '<span class="required-label">Name:</span><input type="text" ng-model="data.name" maxlength="40">',
      title: 'Create Folder',
      subTitle: '',
      scope: $scope,
      buttons: [{
        text: 'Cancel'
      }, {
        text: 'Submit',
        type: 'button-balanced',
        onTap: function(e) {
          return $scope.data;
        }
      }]
    });

    createFolderPopup.then(function(res) {
      if (res) {
        if ($scope.folders.indexOf(res.name) == -1) {
          $scope.folders.push(res.name);
        }
      }
    });
  };

})


.controller('PortfolioFolderCtrl', function($scope, $stateParams) {
  $scope.folder = $stateParams.foldername;
  $scope.papers = {
    "Chemistry" : ["Synthetically producing benzyl alcohol"],
    "Computer Science" : ["Compressed sensing"],
  }

  
})

.controller('PortfolioViewItemCtrl', function($scope, $stateParams, $ionicSlideBoxDelegate, ResearchService) {

  $scope.slides = function(desc) {
    if(desc === "Compressed sensing")
      return ["/img/uc1s1.png", "/img/uc1s2.png", "/img/uc1s3.png"];
    if(desc === "Synthetically producing benzyl alcohol")
      return ["/img/uc2s1.png", "/img/uc2s2.png", "/img/uc2s3.png"];
  }

  $scope.email = function() {
    return ($stateParams.papername === "Compressed sensing") ? "massimo.fornasier@oeaw.ac.at" : "amaguire@uib.no";
  }

  $scope.images = $scope.slides($stateParams.papername);
})

.controller('RequestCtrl', function($scope, $state, RequestService, $ionicPopup) {


  function showAlert(titleMessage, templateMessage) {
    /* Takes a title message and a template message and displays an error alert with the inputted messages. */
    var alertPopup = $ionicPopup.alert({
      title: titleMessage,
      template: templateMessage,
      okType: 'button-balanced'
    });
  }

  function resetRequestData() {
    $scope.requestData = {
      email: "",
      requestContent: "",
      subject: ""
    };
  }

  resetRequestData();

  $scope.postRequest = function() {

    RequestService.addRequest($scope.requestData)
    .then(function() {
        showAlert("Request Posted", "Thanks for sending a request.");
        $state.go('tab.portfolio');
      })
      .catch(function(errorMessage) {
        showAlert("Error", errorMessage);
      });

  };

});
