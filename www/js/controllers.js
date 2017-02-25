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
      name: "",
      bio: ""
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
    var currentYear = new Date().getFullYear();

    if (regData.password1 !== regData.password2) {
      showErrorAlert("Please make sure passwords match.");
      return false;
    } else if (regData.email.length <= 0 || regData.password1.length <= 0 || regData.name.length <= 0) {
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
      $state.go('tab.dash');
    } else {
      // No user is signed in.
      $state.go('login');
    }
  });




})

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope) {

})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});