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

angular.module('Wiled', ['ionic'])

.controller('NewsfeedCtrl', function($scope, $ionicModal, $http) {
  $scope.posts = [

  ];

  $scope.users = [
    { username: 'Here_Comes_The_King' },
    { username: 'GovSchwarzenegger' }
  ];

  // Create and load the Modal
  $ionicModal.fromTemplateUrl('new-user.html', function(modal) {
    $scope.userModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });

  // Called when the form is submitted
  $scope.addUser = function(user) {
    $scope.users.push({
      username: user.username
    });
    $scope.userModal.hide();
    user.title = "";
    $scope.fetchUserPosts(user)
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
        $scope.posts.push({
          title: userPosts[post]['data']['title'],
          author: userPosts[post]['data']['author'],
          url: userPosts[post]['data']['url'],
          created: userPosts[post]['data']['created']
        });
      }

      //sort newsfeed by created date after new posts are fetched
      $scope.sortNewsfeed($scope.posts)
    }, function(err) {
      console.error('ERR', err);
      // err.status will contain the status code
    }) 
  };

  // Sort newsfeed
  $scope.sortNewsfeed = function(list) {
    console.log(list)
    list.sort(function(a, b){
      var keyA = new Date(a.created),
      keyB = new Date(b.created);
      // Compare the 2 dates
      if(keyA > keyB) return -1;
      if(keyA < keyB) return 1;
      return 0;
    });
  };

  angular.forEach($scope.users, function(user){
    $scope.fetchUserPosts(user);
    $scope.sortNewsfeed($scope.posts)
  })

});