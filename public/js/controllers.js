app.controller('LoginCtrl', function($scope, $http, $location, $sessionStorage, UserService) {

  // Start variables
  $scope.message = {
    status: false,
    type: '',
    text: ''
  };
  $scope.user = {
    email: '',
    password: ''
  };

  delete $sessionStorage.user;
  delete $sessionStorage.token;

  // Close alert
  $scope.closeAlert = function() {
    $scope.message = {
      'status': false,
      'type': '',
      'text': ''
    };
  };

  // Submit login form
  $scope.submit = function() {
    UserService.login($scope.user)
      .then(function(data) {
        if (data.data.success) {
          $sessionStorage.user = data.data.user;
          $sessionStorage.token = data.data.token;
          $location.path("/dashboard");
        } else {
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': data.data.message
          };
        }
      }, function(status, data) {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': 'Erro!'
        };
      });
  };
});

app.controller('RegisterCtrl', function($scope, $http, $location, $sessionStorage, UserService) {

  // Start variables
  $scope.message = {
    status: false,
    type: '',
    text: ''
  };

  $scope.user = {
    name: '',
    email: '',
    password: ''
  };

  delete $sessionStorage.user;
  delete $sessionStorage.token;

  // Close alert
  $scope.closeAlert = function() {
    $scope.message = {
      'status': false,
      'type': '',
      'text': ''
    };
  };

  // Submit register form
  $scope.submit = function() {
    UserService.add($scope.user)
      .then(function(data) {
        if (data.data.success) {
          // Login user
          UserService.login($scope.user)
            .then(function(data) {
              if (data.data.success) {
                $sessionStorage.user = data.data.user;
                $sessionStorage.token = data.data.token;
                $location.path("/dashboard");
              } else {
                $scope.message = {
                  'status': true,
                  'type': 'error',
                  'text': data.data.message
                };
              }
            }, function(status, data) {
              $scope.message = {
                'status': true,
                'type': 'error',
                'text': 'Erro!'
              };
            });
        } else {
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': data.data.message
          };
        }
      }, function(status, data) {
        if (status.data.message == 'Duplicate email')
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': 'Este e-mail já existe, faça o login!'
          };
        else
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': 'Erro!'
          };
      });
  };
});

app.controller('LogoutCtrl', function($location, $sessionStorage) {
  delete $sessionStorage.user;
  delete $sessionStorage.token;
  $location.path('/login');
});

app.controller('DashboardCtrl', function($scope, $location, $sessionStorage, UserService) {

  var userId = $sessionStorage.user;

  UserService.findById(userId)
    .then(function(result) {
      if (result.data.success) {
        UserService.set(result.data.data);
        if (result.data.data.events[0]) {
          showCounters(result.data.data.events[0]);
        } else {
          $location.path("/evento");
        }
      } else {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': result.data.message
        };
      }
    }, function(status, result) {
      $scope.message = {
        'status': true,
        'type': 'error',
        'text': 'Erro!'
      };
    });

  function showCounters(event) {
    var eventGifts = event.products.filter(function(el) {
      return el.bought > 0;
    });

    var eventConfirmations = event.confirmations.filter(function(el) {
      return el.accept == true;
    });

    $scope.eventGifts = eventGifts.length;
    $scope.eventDonations = 'R$ 123,45';
    $scope.eventConfirmations = eventConfirmations.length;
  }
});

app.controller('EventCtrl', function($scope, $sessionStorage, $window, UserService, EventService) {

  var userId = $sessionStorage.user;
  $scope.fileUploaded = false;

  EventService.findById(userId)
    .then(function(data) {
      if (data.data.success) {
        data.data.data.date = new Date(data.data.data.date);
        $scope.event = data.data.data;
      } else {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': data.data.message
        };
      }
    });

  // Close alert
  $scope.closeAlert = function() {
    $scope.message = {
      'status': false,
      'type': '',
      'text': ''
    };
  };

  // Check if uploaded
  $scope.fileChanged = function() {
    $scope.fileUploaded = true;
  }

  $scope.editEvent = function() {
    // Check if uploaded
    if ($scope.fileUploaded) {
      $scope.upload($scope.event.image);
    } else {
      $scope.update();
    }
  }

  $scope.upload = function(file) {
    EventService.upload(userId, file)
      .then(function(resp) {
        if (resp.data.success) {
          console.log('Success ' + resp.config.data.file.name + ' uploaded');
        } else {
          console.log('Error: ' + resp.status);
        }
        $scope.update(resp.data.data);
      }, function(resp) {
        console.log('Error status: ' + resp.status);
      });
  };

  $scope.update = function(image) {
    // Check for new image
    if (image) {
      $scope.event.image = image;
    }
    EventService.update(userId, $scope.event)
      .then(function(resp) {
        if (resp.data.success) {
          $scope.event.date = new Date($scope.event.date).toLocaleDateString();
          $scope.message = {
            'status': true,
            'type': 'success',
            'text': 'Evento atualizado com sucesso.'
          };
        } else {
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': resp.data.message
          };
        }
        $window.scrollTo(0, angular.element(document.getElementById('header')).offsetTop);
      }, function(status, resp) {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': 'Este site já existe, escolha outro por favor!'
        };
        $window.scrollTo(0, angular.element(document.getElementById('header')).offsetTop);
      });
  };

  $scope.$watch('event.name', function() {
    $scope.event.slug = slugGenerate($scope.event.name);
  });

  // Generate slug
  function slugGenerate(input) {
    if (!input) return;
    // make lower case and trim
    var slug = input.toLowerCase().trim();

    // Replace special characters
    var mapAccentsHex = {
      a: /[\xE0-\xE6]/g,
      e: /[\xE8-\xEB]/g,
      i: /[\xEC-\xEF]/g,
      o: /[\xF2-\xF6]/g,
      u: /[\xF9-\xFC]/g,
      c: /\xE7/g,
      n: /\xF1/g
    };
    for (var letter in mapAccentsHex) {
      var regularExpression = mapAccentsHex[letter];
      slug = slug.replace(regularExpression, letter);
    }

    // replace invalid chars with spaces
    slug = slug.replace(/[^a-z0-9\s-]/g, ' ');
    // replace multiple spaces or hyphens with a single hyphen
    slug = slug.replace(/[\s-]+/g, '-');

    return slug;
  }
});

app.controller('PresentsCtrl', function($scope, $sessionStorage, $window, ProductService) {

  var userId = $sessionStorage.user;
  $scope.page = 1;
  $scope.sort = 'rate';

  ProductService.findAll(userId)
    .then(function(result) {
      if (result.data.success) {
        $scope.myList = result.data.data;
        $scope.getProducts(1, $scope.sort);
      } else {
        $scope.myList = null;
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': result.data.message
        };
      }
    }, function(status, result) {
      $scope.myList = null;
      $scope.message = {
        'status': true,
        'type': 'error',
        'text': 'Erro!'
      };
    });

  $scope.getProducts = function(page, sort) {

    var search = $scope.search ? $scope.search : 'eletrodomestico';

    ProductService.searchBuscape(search, page, sort)
      .then(function(data) {
        if (data.status == 200) {

          // Check if Buscape product has already been added
          if (data.data.product.length > 0 && $scope.myList) {
            for (var i = 0; i < data.data.product.length; i++) {
              for (var j = 0; j < $scope.myList.length; j++) {
                if (data.data.product[i].product.id == $scope.myList[j].buscapeId) {
                  data.data.product[i].product.added = true;
                  data.data.product[i].product._id = $scope.myList[j]._id;
                }
              }
            }
          }
          $scope.products = data.data.product;

          // Pagination
          var pages = [];
          for (var i = 1; i <= data.data.totalpages; i++) {
            pages.push(i);
          }
          $scope.totalPages = pages;
        } else {
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': data.data.message
          };
        }
      }, function(status, data) {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': 'Erro!'
        };
      });
  }

  $scope.add = function(product) {

    var ProductNew = {
      buscapeId: product.id,
      categoryid: product.categoryid,
      name: product.productname,
      pricemin: product.pricemin,
      pricemax: product.pricemax,
      link: product.links[0].link.url,
      image: product.thumbnail.url,
      bought: 0
    };

    ProductService.add(userId, ProductNew)
      .then(function(result) {
        if (result.data.success) {
          $scope.message = {
            'status': true,
            'type': 'success',
            'text': 'Produto adicionado com sucesso!'
          };
          for (var i = 0; i < $scope.products.length; i++) {
            if ($scope.products[i].product.id == product.id) {
              $scope.products[i].product.added = true;
              $scope.products[i].product._id = result.data.productId;
              break;
            }
          }
        } else {
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': result.data.message
          };
        }
      }, function(status, result) {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': 'Erro!'
        };
      });
  }

  $scope.remove = function(productId) {
    ProductService.delete(userId, productId)
      .then(function(result) {
        if (result.data.success) {
          $scope.message = {
            'status': true,
            'type': 'success',
            'text': 'Produto removido com sucesso!'
          };
          for (var i = 0; i < $scope.products.length; i++) {
            if ($scope.products[i].product._id == productId) {
              $scope.products[i].product.added = false;
              break;
            }
          }
        } else {
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': data.data.message
          };
        }
      }, function(status, data) {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': 'Erro!'
        };
      });
  }

  $scope.sorting = function() {
    $scope.getProducts($scope.page, $scope.sort);
  }

  $scope.pagination = function(number) {
    if (number > 0 && number <= $scope.totalPages.length) {
      $scope.page = number;
      $scope.getProducts(number, $scope.sort);
      $window.scrollTo(0, angular.element(document.getElementById('header')).offsetTop);
    }
  }

  $scope.$watch('search', function() {
    $scope.getProducts(1, $scope.sort);
  });
});

app.controller('MyListCtrl', function($scope, $sessionStorage, ProductService) {

  var userId = $sessionStorage.user;

  ProductService.findAll(userId)
    .then(function(result) {
      if (result.data.success) {
        $scope.myList = result.data.data;
      } else {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': result.data.message
        };
      }
    }, function(status, result) {
      $scope.message = {
        'status': true,
        'type': 'error',
        'text': 'Erro!'
      };
    });

  $scope.remove = function(productId) {
    ProductService.delete(userId, productId)
      .then(function(data) {
        if (data.data.success) {
          $scope.message = {
            'status': true,
            'type': 'success',
            'text': 'Produto removido com sucesso!'
          };
          $scope.myList = $scope.myList.filter(function(el) {
            return el._id !== productId;
          });
        } else {
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': data.data.message
          };
        }
      }, function(status, data) {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': 'Erro!'
        };
      });
  }
});

app.controller('MyPresentsCtrl', function($scope, $sessionStorage, ProductService) {

  var userId = $sessionStorage.user;

  ProductService.bought(userId)
    .then(function(result) {
      if (result.data.success) {
        $scope.myPresents = result.data.data;
      } else {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': result.data.message
        };
      }
    }, function(status, result) {
      $scope.message = {
        'status': true,
        'type': 'error',
        'text': 'Erro!'
      };
    });
});

app.controller('PublicCtrl', function($scope, $routeParams, $sessionStorage, $window, $location, SweetAlert, EventService, ProductService) {

  var userId;

  EventService.findByName($routeParams.slug)
    .then(function(result) {
      if (result.data.success) {
        $scope.event = result.data.data.events[0];
        userId = result.data.data._id;
      } else {
        $location.path("/404");
      }
    }, function(status, result) {
      $location.path("/404");
    });

  $scope.buy = function(product) {
    if (product.bought > 0) {
      SweetAlert.confirm("Por favor, escolha uma loja que ofereça a troca do produto.", { title: "Este produto já foi comprado!", confirmButtonText: 'Comprar!', cancelButtonText: 'Escolher outro produto', type: 'info' })
        .then(function(isConfirm) {
          if (isConfirm) {
            bought(product);
            SweetAlert.success("Este produto foi marcado como comprado.", { title: "Obrigado!" });
          }
        });
    } else {
      bought(product);
    }
  }

  function bought(product) {
    product.bought = (product.bought || 0) + 1;

    ProductService.buy(userId, product._id, product.bought)
      .then(function(result) {
        if (!result.data.success) {
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': result.data.message
          };
        }
      }, function(status, result) {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': 'Erro!'
        };
      });
  }
});

app.controller('ConfirmationsCtrl', function($scope, $sessionStorage, EventService) {

  var userId = $sessionStorage.user;

  EventService.confirmations(userId)
    .then(function(result) {
      if (result.data.success) {
        $scope.confirmations = result.data.data;
      } else {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': result.data.message
        };
      }
    }, function(status, result) {
      $scope.message = {
        'status': true,
        'type': 'error',
        'text': 'Erro!'
      };
    });
});

app.controller('PublicConfirmationCtrl', function($scope, $window, $routeParams, EventService) {

  var userId;

  EventService.findByName($routeParams.slug)
    .then(function(result) {
      if (result.data.success) {
        $scope.event = result.data.data.events[0];
        userId = result.data.data._id;
      } else {
        $location.path("/404");
      }
    }, function(status, result) {
      $location.path("/404");
    });

  $scope.addConfirmation = function(confirmation) {

    if (!$scope.confirmation.form.$valid) {
      return;
    }

    var ConfirmationNew = {
      name: confirmation.name,
      accept: confirmation.accept,
      adults: confirmation.adults,
      children: confirmation.children,
      email: confirmation.email,
      phone: confirmation.phone,
      message: confirmation.message
    };

    EventService.confirmation(userId, ConfirmationNew)
      .then(function(result) {
        if (result.data.success) {
          $scope.message = {
            'status': true,
            'type': 'success',
            'text': 'Confirmação enviada com sucesso!'
          };
          $scope.confirmation = {
            name: '',
            accept: '',
            adults: '',
            accept: '',
            children: '',
            email: '',
            phone: '',
            message: ''
          };
        } else {
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': result.data.message
          };
        }
        $window.scrollTo(0, angular.element(document.getElementById('header')).offsetTop);
      }, function(status, result) {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': 'Erro!'
        };
        $window.scrollTo(0, angular.element(document.getElementById('header')).offsetTop);
      });
  }

  // Close alert
  $scope.closeAlert = function() {
    $scope.message = {
      'status': false,
      'type': '',
      'text': ''
    };
  };
});

app.controller('DonationsCtrl', function($scope, $sessionStorage, EventService) {

  var userId = $sessionStorage.user;

  EventService.donations(userId)
    .then(function(result) {
      if (result.data.success) {
        $scope.donations = result.data.data;
      } else {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': result.data.message
        };
      }
    }, function(status, result) {
      $scope.message = {
        'status': true,
        'type': 'error',
        'text': 'Erro!'
      };
    });

  $scope.getStatus = function(id) {
    var status = '';
    switch (id) {
      case '1':
        status = 'Aguardando pagamento';
        break;
      case '2':
        status = 'Em análise';
        break;
      case '3':
        status = 'Paga';
        break;
      case '4':
        status = 'Disponível';
        break;
      case '5':
        status = 'Em disputa';
        break;
      case '6':
        status = 'Devolvida';
        break;
      case '7':
        status = 'Cancelada';
        break;
      default:
        status = id;
    }
    return status;
  }
});

app.controller('PublicDonationCtrl', function($scope, $routeParams, $location, EventService) {

  var userId;

  EventService.findByName($routeParams.slug)
    .then(function(result) {
      if (result.data.success) {
        $scope.event = result.data.data.events[0];
        userId = result.data.data._id;

        if (!result.data.data.events[0].emailPagseguro || !result.data.data.events[0].tokenPagseguro) {
          $location.path('/' + $routeParams.slug);
        }
      } else {
        $location.path("/404");
      }
    }, function(status, result) {
      $location.path("/404");
    });

  $scope.saveDonation = function(donation) {

    if (!$scope.donation.form.$valid) {
      return;
    }

    var DonationNew = {
      name: donation.name,
      email: donation.email,
      amount: donation.amount
    };

    EventService.donation(userId, DonationNew)
      .then(function(result) {
        if (result.data.success) {
          var isOpenLightbox = PagSeguroLightbox({
            code: result.data.code
          }, {
            success: function(transactionCode) {
              console.log("success - " + transactionCode);
            },
            abort: function() {
              console.log("abort");
            }
          });
          if (!isOpenLightbox) {
            location.href = "https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html?code=" + code;
          }
        } else {
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': result.data.message
          };
        }
      }, function(status, result) {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': 'Erro!'
        };
      });
  }
});

app.controller('HomeCtrl', function($scope, $routeParams, EventService) {});
