// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('Wiled', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

angular.module('ionic.utils', [])

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}]);

angular.module('Wiled', ['ionic', 'ionic.utils'])

.controller('NewsfeedCtrl', function($scope, $ionicModal, $http, $ionicPopup, $localstorage, $ionicActionSheet) {
  $scope.posts = [];

  $scope.users = JSON.parse($localstorage.get('users') || '[{"username":"Here_Comes_The_King"},{"username":"GovSchwarzenegger"}]')

  // Create and load the Modal
  $ionicModal.fromTemplateUrl('new-user.html', function(modal) {
    $scope.userModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });

  // Called when the form is submitted
  $scope.addUser = function(user) {
    var isExistingUser = $scope.checkExistingFollowedUser(user);

    if(!isExistingUser){
      $scope.users.push({
        username: user.username
      });
      $scope.addUserToLocalStorage(user);
      $scope.userModal.hide();
      user.title = "";
      $scope.fetchUserPosts(user);
    }
  };

  // Check for existing followed user
  $scope.checkExistingFollowedUser = function(user) {
    for (var i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i]['username'] === user.username) { 
        $scope.showAlert('Alert!', user.username + ' is already being followed.');
        $scope.closeNewUser();
        return true;
      }
    }
    return false;
  };

  // Unfollow a user
  $scope.unfollowUser = function(user) {
    for (var i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i]['username'] === user.username) { 
        $scope.users.splice(i, 1);
        break;
      }
    }
    $scope.removeUserFromLocalStorage(user);
    $scope.removeUserPosts(user);
  };

  // Open our new user modal
  $scope.newUser = function() {
    $scope.userModal.show();
  };

  // Close the new user modal
  $scope.closeNewUser = function() {
    $scope.userModal.hide();
  };

  // Fetch user posts
  $scope.fetchUserPosts = function(user) {
    $http.get('https://www.reddit.com/user/' + user.username + '/submitted.json').then(function(resp) {
      userPosts = resp['data']['data']['children']
      for (post in userPosts) {
        // check for thumbnail
        var media = userPosts[post]['data']['media']
        if (media === null) {
          thumbnail_url = null;
        } else {
          thumbnail_url = media['oembed']['thumbnail_url']
        }

        //add post
        $scope.posts.push({
          title: userPosts[post]['data']['title'],
          author: userPosts[post]['data']['author'],
          url: userPosts[post]['data']['url'],
          thumbnail_url: thumbnail_url,
          subreddit: userPosts[post]['data']['subreddit'],
          score: userPosts[post]['data']['score'],
          created: userPosts[post]['data']['created']
        });
      }

      //sort newsfeed by created date after new posts are fetched
      $scope.sortNewsfeedByNewest($scope.posts)
    }, function(err) {
      console.error('ERR', err);
      // err.status will contain the status code
    }) 
  };

  // Remove user posts
  $scope.removeUserPosts = function(user) {
    for(var i = $scope.posts.length -1; i >= 0 ; i--){
      if($scope.posts[i]['author'] === user.username){
        $scope.posts.splice(i, 1);
      }
    }
  }

  // Sort newsfeed by newest descending
  $scope.sortNewsfeedByNewest = function(list) {
    list.sort(function(a, b){
      var keyA = new Date(a.created),
      keyB = new Date(b.created);
      // Compare the 2 dates
      if(keyA > keyB) return -1;
      if(keyA < keyB) return 1;
      return 0;
    });
  };

  // Sort newsfeed by popularity (most points)
  $scope.sortNewsfeedByPopular = function(list) {
    list.sort(function(a, b){
      var keyA = new Date(a.score),
      keyB = new Date(b.score);
      // Compare the 2 dates
      if(keyA > keyB) return -1;
      if(keyA < keyB) return 1;
      return 0;
    });
  };

  // Alert dialog
  $scope.showAlert = function(title, template) {
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: template
    });
    alertPopup.then(function(res) {
      console.log(title + ' - ' + template);
    });
  };

  //Add username to localstorage
  $scope.addUserToLocalStorage = function(user) {
    // Parse any JSON previously stored in allEntries
    var existingEntries = JSON.parse(localStorage.getItem("users"));
    if(existingEntries == null) existingEntries = [];

    localStorage.setItem("users", JSON.stringify(user));
    // Save allEntries back to local storage
    existingEntries.push(user);
    localStorage.setItem("users", JSON.stringify(existingEntries));
  };

  //Remove username from localstorage
  $scope.removeUserFromLocalStorage = function(user) {
    // Parse any JSON previously stored in allEntries
    var existingEntries = JSON.parse(localStorage.getItem("users"));
    if(existingEntries == null) existingEntries = [];

    // Save allEntries back to local storage
    for(var i = existingEntries.length -1; i >= 0 ; i--){
      if(existingEntries[i]['username'] === user.username){
        existingEntries.splice(i, 1);
      }
    }

    localStorage.setItem("users", JSON.stringify(existingEntries));
  };

  // Show sort options
  $scope.showSortOptions = function() {
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'New' },
        { text: 'Popular' }
      ],
      titleText: 'Sort posts by:',
      cancelText: 'Cancel',
      cancel: function() {
        return false;
      },
      buttonClicked: function(index) {
        //index is the index of button clicked
        // {0: 'New', 1: 'Popular'}
        if (index === 1) {
          $scope.sortNewsfeedByPopular($scope.posts);
          return true;
        } else {
          $scope.sortNewsfeedByNewest($scope.posts);
          return true;
        }
      }
    });
  };

  angular.forEach($scope.users, function(user){
    $scope.fetchUserPosts(user);
    $scope.sortNewsfeedByNewest($scope.posts)
  })

});
