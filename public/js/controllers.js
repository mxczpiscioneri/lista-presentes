app.controller('LoginCtrl', function($scope, $rootScope, $http, $location, $sessionStorage, UserService) {

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

  // Remove loader
  $rootScope.isLoading = false;

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
          'text': 'E-mail ou senha incorreto!'
        };
      });
  };
});

app.controller('RegisterCtrl', function($scope, $rootScope, $http, $location, $sessionStorage, UserService) {

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

  // Remove loader
  $rootScope.isLoading = false;

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
            'text': 'E-mail já existe, faça o login!'
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

app.controller('DashboardCtrl', function($scope, $rootScope, $location, $sessionStorage, UserService) {

  var userId = $sessionStorage.user;

  UserService.findById(userId)
    .then(function(result) {
      // Remove loader
      $rootScope.isLoading = false;

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

    var eventDonations = event.donations.filter(function(el) {
      return el.status == 3 || el.status == 4;
    });
    var totalDonations = 0;
    for (var i in eventDonations) {
      totalDonations += eventDonations[i].amount;
    }

    $scope.eventGifts = eventGifts.length;
    $scope.eventDonations = totalDonations;
    $scope.eventConfirmations = eventConfirmations.length;
  }
});

app.controller('EventCtrl', function($scope, $rootScope, $sessionStorage, $window, $location, UserService, EventService) {

  var userId = $sessionStorage.user;
  $scope.fileUploaded = false;
  $scope.checkPassword = "false";
  $scope.createSlug = true;
  $scope.S3_ENDPOINT = S3_ENDPOINT;
  $scope.buttonLoading = false;

  EventService.findById(userId)
    .then(function(data) {
      // Remove loader
      $rootScope.isLoading = false;
      $scope.imageCustom = false;

      if (data.data.success) {
        data.data.data.date = new Date(data.data.data.date);
        $scope.event = data.data.data;
        if (!$scope.event.image) {
          $scope.event.image = "cover-default1.jpg";
        } else if ($scope.event.image != "cover-default1.jpg" && $scope.event.image != "cover-default2.jpg" && $scope.event.image != "cover-default3.jpg" && $scope.event.image != "cover-default4.jpg") {
          $scope.imageCustom = data.data.data.image;
        }
        $scope.checkPassword = data.data.data.password ? "true" : "false";
        if (data.data.data.slug) {
          $scope.createSlug = false;
        }
        $scope.EVENT_URL = $location.protocol() + "://" + location.host + "/" + data.data.data.slug;
      } else {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': data.data.message
        };
      }
    }, function(resp) {
      // Remove loader
      $rootScope.isLoading = false;
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

    if (!$scope.form.$valid) {
      return;
    }

    $scope.buttonLoading = true;

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
    // Clear password
    if ($scope.checkPassword == "false") {
      $scope.event.password = null;
    }
    EventService.update(userId, $scope.event)
      .then(function(resp) {
        if (resp.data.success) {
          $scope.event.date = new Date($scope.event.date).toLocaleDateString();
          if ($scope.event.image == "cover-default1.jpg" || $scope.event.image == "cover-default2.jpg" || $scope.event.image == "cover-default3.jpg" || $scope.event.image == "cover-default4.jpg") {
            $scope.imageCustom = false;
          }
          $scope.message = {
            'status': true,
            'type': 'success',
            'text': 'Evento atualizado com sucesso.'
          };
        } else {
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': 'Erro!'
          };
        }
        $scope.buttonLoading = false;
        $window.scrollTo(0, angular.element(document.getElementById('header')).offsetTop);
      }, function(error) {
        if (error.data.message == 'Duplicate slug') {
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': 'Este nome de site já existe, escolha outro!'
          };
        } else {
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': 'Erro!'
          };
        }
        $window.scrollTo(0, angular.element(document.getElementById('header')).offsetTop);
      });
  };

  $scope.$watch('event.name', function() {
    if ($scope.event.name && $scope.createSlug) {
      $scope.event.slug = slugGenerate($scope.event.name);
    }
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

app.controller('PresentsCtrl', function($scope, $rootScope, $sessionStorage, $window, Popeye, ProductService) {

  var userId = $sessionStorage.user;
  $scope.page = 1;
  $scope.sort = 'rate';
  $scope.isLoadingBuscape = true;
  $scope.fileUploaded = false;
  $scope.buttonLoading = false;

  ProductService.findAll(userId)
    .then(function(result) {
      // Remove loader
      $rootScope.isLoading = false;

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

    // Show loader
    $scope.isLoadingBuscape = true;
    $scope.message = {
      'status': false,
      'type': '',
      'text': ''
    };

    var search = $scope.search ? $scope.search : 'eletrodomestico';
    ProductService.searchBuscape(search, page, sort)
      .then(function(data) {
        // Clear products
        $scope.products = [];

        if (data.status == 200) {

          // Check if Buscape product has already been added
          if (data.data.product && data.data.product.length > 0 && $scope.myList) {
            for (var i = 0; i < data.data.product.length; i++) {
              for (var j = 0; j < $scope.myList.length; j++) {
                if (data.data.product[i].product.id == $scope.myList[j].buscapeId) {
                  data.data.product[i].product.added = true;
                  data.data.product[i].product._id = $scope.myList[j]._id;
                }
              }
            }
          } else {
            $scope.message = {
              'status': true,
              'type': 'error',
              'text': 'Nenhum produto encontrado!'
            };
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
        // Remove loader
        $scope.isLoadingBuscape = false;
      }, function(status, data) {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': 'Erro!'
        };
      });
  }

  $scope.add = function(product, index) {
    // Load button
    $scope.buttonLoading = true;
    document.getElementById("btnLoadingA" + index).className = 'btnLoading';

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
        $scope.buttonLoading = false;
        document.getElementById("btnLoadingA" + index).className = 'btnLoading hidden';
      }, function(status, result) {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': 'Erro!'
        };
      });
  }

  $scope.remove = function(productId, index) {
    // Load button
    $scope.buttonLoading = true;
    document.getElementById("btnLoadingR" + index).className = 'btnLoading';

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
        $scope.buttonLoading = false;
        document.getElementById("btnLoadingR" + index).className = 'btnLoading hidden';
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

  $scope.searchBuscape = function() {
    $scope.getProducts(1, $scope.sort);
  }

  // Open modal
  $scope.showModal = function() {
    var modal = Popeye.openModal({
      templateUrl: "/views/modal-add-produto.html",
      controller: "PresentsCtrl"
    });
  }

  // Check if uploaded
  $scope.fileChanged = function() {
    $scope.fileUploaded = true;
  }

  // Create new product
  $scope.saveNewProduct = function() {
    if (!$scope.form.$valid) {
      return;
    }

    $scope.buttonLoading = true;

    // Check if uploaded
    if ($scope.fileUploaded) {
      ProductService.upload(userId, $scope.modal.image)
        .then(function(result) {
          if (result.data.success) {
            var ProductNew = {
              name: $scope.modal.name,
              pricemin: $scope.modal.pricemin,
              link: $scope.modal.link,
              image: S3_ENDPOINT + '/product/' + result.data.data,
              bought: 0
            };
            $scope.create(ProductNew);
          } else {
            console.log('Error: ' + result.status);
            $scope.buttonLoading = false;
          }
        }, function(result) {
          console.log('Error status: ' + result.status);
        });
    } else {
      var ProductNew = {
        name: $scope.modal.name,
        pricemin: $scope.modal.pricemin,
        link: $scope.modal.link,
        bought: 0
      };
      $scope.create(ProductNew);
    }
  }

  $scope.create = function(ProductNew) {
    ProductService.add(userId, ProductNew)
      .then(function(result) {
        if (result.data.success) {
          $scope.message = {
            'status': true,
            'type': 'success',
            'text': 'Procuto criado e adicionado com sucesso.'
          };
        } else {
          $scope.message = {
            'status': true,
            'type': 'error',
            'text': 'Erro!'
          };
        }
        $scope.buttonLoading = false;
        Popeye.closeCurrentModal()
      }, function(error) {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': 'Erro!'
        };
      });
  }
});

app.controller('MyListCtrl', function($scope, $rootScope, $sessionStorage, ProductService) {

  var userId = $sessionStorage.user;
  $scope.buttonLoading = false;

  ProductService.findAll(userId)
    .then(function(result) {
      // Remove loader
      $rootScope.isLoading = false;

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

  $scope.remove = function(productId, index) {
    // Load button
    $scope.buttonLoading = true;
    document.getElementById("btnLoadingR" + index).className = 'btnLoading';

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
        $scope.buttonLoading = false;
        document.getElementById("btnLoadingR" + index).className = 'btnLoading hidden';
      }, function(status, data) {
        $scope.message = {
          'status': true,
          'type': 'error',
          'text': 'Erro!'
        };
      });
  }
});

app.controller('MyPresentsCtrl', function($scope, $rootScope, $sessionStorage, ProductService) {

  var userId = $sessionStorage.user;

  ProductService.bought(userId)
    .then(function(result) {
      // Remove loader
      $rootScope.isLoading = false;

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

app.controller('PublicCtrl', function($scope, $rootScope, $routeParams, $location, EventService, ProductService) {

  var userId;
  $scope.needPassword = false;
  $scope.S3_ENDPOINT = S3_ENDPOINT;

  EventService.findByName($routeParams.slug)
    .then(function(result) {
      // Remove loader
      $rootScope.isLoading = false;

      if (result.data.success) {
        // Verify password in event
        if (result.data.password) {
          $scope.needPassword = true;
        }
        $scope.event = result.data.data.events[0];
        userId = result.data.data._id;
      } else {
        $location.path("/404");
      }
    }, function(status, result) {
      $location.path("/404");
    });

  $scope.buy = function(product) {
    if ($scope.needPassword) {
      swal({
          title: "Digite a senha",
          text: "Por favor, insira a senha que veio no convite:",
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top",
          inputPlaceholder: "Digite a senha",
          confirmButtonColor: "#FF564A"
        },
        function(inputValue) {
          if (inputValue === false) return false;

          if (inputValue === "") {
            swal.showInputError("Por favor, digite a senha!");
            return false
          }

          bought(product, inputValue);
        });
    } else {
      bought(product, false);
    }
  }

  function bought(product, password) {
    var bought = (product.bought || 0) + 1;
    ProductService.buy(userId, product._id, bought, password)
      .then(function(result) {
        if (result.data.success) {
          product.bought = bought;
          swal({
            title: "Obrigado!",
            text: `Produto marcado como comprado com sucesso.<a href="${product.link}" class="text-sm text-secondary align-center block margin-top-lg" target="_blank">${product.name}</a>`,
            type: "success",
            html: true,
            confirmButtonColor: "#FF564A"
          });
        } else {
          swal.showInputError("Senha incorreta!");
          return false
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

app.controller('ConfirmationsCtrl', function($scope, $rootScope, $sessionStorage, EventService) {

  var userId = $sessionStorage.user;

  EventService.confirmations(userId)
    .then(function(result) {
      // Remove loader
      $rootScope.isLoading = false;

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

app.controller('PublicConfirmationCtrl', function($scope, $rootScope, $routeParams, EventService) {

  var userId;
  $scope.needPassword = false;
  $scope.S3_ENDPOINT = S3_ENDPOINT;

  EventService.findByName($routeParams.slug)
    .then(function(result) {
      // Remove loader
      $rootScope.isLoading = false;

      if (result.data.success) {
        // Verify password in event
        if (result.data.password) {
          $scope.needPassword = true;
        }
        $scope.event = result.data.data.events[0];
        userId = result.data.data._id;
        $scope.confirmation = {
          accept: "true"
        };
      } else {
        $location.path("/404");
      }
    }, function(status, result) {
      $location.path("/404");
    });

  $scope.addConfirmation = function(confirmation) {

    if (!$scope.form.$valid) {
      return;
    }

    var ConfirmationNew = {
      name: confirmation.name,
      accept: confirmation.accept,
      adults: confirmation.adults,
      children: confirmation.children || 0,
      email: confirmation.email,
      phone: confirmation.phone,
      message: confirmation.message
    };

    if ($scope.needPassword) {
      swal({
          title: "Digite a senha",
          text: "Por favor, insira a senha que veio no convite:",
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top",
          inputPlaceholder: "Digite a senha",
          confirmButtonColor: "#FF564A"
        },
        function(inputValue) {
          if (inputValue === false) return false;

          if (inputValue === "") {
            swal.showInputError("Por favor, digite a senha!");
            return false
          }

          confirm(ConfirmationNew, inputValue);
        });
    } else {
      confirm(ConfirmationNew, false);
    }
  }

  function confirm(ConfirmationNew, password) {
    EventService.confirmation(userId, ConfirmationNew, password)
      .then(function(result) {
        if (result.data.success) {
          swal({
            title: "Obrigado!",
            text: "Confirmação realizada com sucesso.",
            type: "success",
            confirmButtonColor: "#FF564A"
          });
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
          swal.showInputError("Senha incorreta!");
          return false
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

app.controller('DonationsCtrl', function($scope, $rootScope, $sessionStorage, EventService) {

  var userId = $sessionStorage.user;

  EventService.donations(userId)
    .then(function(result) {
      // Remove loader
      $rootScope.isLoading = false;

      if (result.data.success) {
        var eventDonations = result.data.data.filter(function(el) {
          return el.status && el.transaction;
        });
        $scope.donations = eventDonations;

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

app.controller('PublicDonationCtrl', function($scope, $rootScope, $routeParams, $location, EventService) {

  var userId;
  $scope.S3_ENDPOINT = S3_ENDPOINT;

  EventService.findByName($routeParams.slug)
    .then(function(result) {
      // Remove loader
      $rootScope.isLoading = false;

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

    if (!$scope.form.$valid) {
      return;
    }
    document.getElementById("saveDonation").disabled = true;

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
              swal({
                title: "Obrigado!",
                text: "Doação realizada com sucesso.",
                type: "success",
                confirmButtonColor: "#FF564A"
              });
              $scope.donation = {
                name: '',
                email: ''
              };
            }
          });
          if (!isOpenLightbox) {
            location.href = "https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html?code=" + code;
          }
        } else {
          swal({
            title: "Oops!",
            text: `Ocorreu um erro, por favor tente novamente. ${result.data.message}`,
            type: "error"
          });
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

app.controller('HomeCtrl', function($scope, $rootScope, $routeParams, EventService) {
  // Remove loader
  $rootScope.isLoading = false;
});
