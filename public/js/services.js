app.factory('TokenInterceptor', function($q, $sessionStorage, $location) {
  return {
    request: function(config) {
      config.headers = config.headers || {};
      if ($sessionStorage.token) {
        config.headers['x-access-token'] = $sessionStorage.token;
      }
      return config;
    },
    responseError: function(rejection) {
      if (rejection.status === 401 || rejection.status === 403) {
        $location.path('/login');
      }
      return $q.reject(rejection);
    }
  };
});

app.factory('UserService', function($http, $rootScope) {
  return {
    login: function(user) {
      return $http.post(API_ENDPOINT + '/authenticate/', user);
    },
    findAll: function() {
      return $http.get(API_ENDPOINT + '/users/');
    },
    findById: function(id) {
      return $http.get(API_ENDPOINT + '/users/' + id);
    },
    add: function(user) {
      return $http.post(API_ENDPOINT + '/users/', user);
    },
    update: function(id, user) {
      return $http.put(API_ENDPOINT + '/users/' + id, user);
    },
    delete: function(id) {
      return $http.delete(API_ENDPOINT + '/users/' + id);
    },
    get: function() {
      return $rootScope.user;
    },
    set: function(user) {
      $rootScope.user = user;
    }
  }
});

app.factory('EventService', function($http, Upload) {
  return {
    findById: function(userId) {
      return $http.get(API_ENDPOINT + '/users/' + userId + '/events/');
    },
    findByName: function(slug) {
      return $http.get(API_ENDPOINT + '/events/' + slug);
    },
    confirmations: function(userId) {
      return $http.get(API_ENDPOINT + '/users/' + userId + '/events/confirmations');
    },
    confirmation: function(userId, confirmation, password) {
      return $http.post(API_ENDPOINT + '/users/' + userId + '/events/confirmation/password/' + password, confirmation);
    },
    donations: function(userId) {
      return $http.get(API_ENDPOINT + '/users/' + userId + '/events/donations');
    },
    donation: function(userId, donation) {
      return $http.post(API_ENDPOINT + '/users/' + userId + '/events/donation', donation);
    },
    add: function(userId, event) {
      return $http.post(API_ENDPOINT + '/users/' + userId + '/events/', event);
    },
    update: function(userId, event) {
      return $http.put(API_ENDPOINT + '/users/' + userId + '/events/', event);
    },
    upload: function(userId, fileUpload) {
      return Upload.upload({ url: API_ENDPOINT + '/users/' + userId + '/events/upload/', data: { file: fileUpload } });
    }
  }
});

app.factory('ProductService', function($http, Upload) {
  return {
    searchBuscape: function(search, page, sort) {
      return $http.get(API_ENDPOINT + '/products/search/' + search + '/' + page + '/' + sort);
    },
    findAll: function(userId) {
      return $http.get(API_ENDPOINT + '/users/' + userId + '/products/');
    },
    findById: function(userId, productId) {
      return $http.get(API_ENDPOINT + '/users/' + userId + '/products/' + productId);
    },
    buy: function(userId, productId, bought, password) {
      return $http.get(API_ENDPOINT + '/users/' + userId + '/products/' + productId + '/buy/' + bought + '/password/' + password);
    },
    bought: function(userId) {
      return $http.get(API_ENDPOINT + '/users/' + userId + '/products/bought');
    },
    add: function(userId, product) {
      return $http.post(API_ENDPOINT + '/users/' + userId + '/products/', product);
    },
    update: function(userId, productId) {
      return $http.put(API_ENDPOINT + '/users/' + userId + '/products/' + productId, product);
    },
    delete: function(userId, productId) {
      return $http.delete(API_ENDPOINT + '/users/' + userId + '/products/' + productId);
    },
    upload: function(userId, fileUpload) {
      return Upload.upload({ url: API_ENDPOINT + '/users/' + userId + '/products/upload/', data: { file: fileUpload } });
    }
  }
});
