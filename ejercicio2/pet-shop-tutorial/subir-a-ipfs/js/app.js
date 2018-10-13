App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    /**$.getJSON('../pets.json', function(data) {*/
      data = [
        {
          "id": 0,
          "name": "Frieda",
          "picture": "images/scottish-terrier.jpeg",
          "age": 3,
          "breed": "Scottish Terrier",
          "location": "Lisco, Alabama"
        },
        {
          "id": 1,
          "name": "Gina",
          "picture": "images/scottish-terrier.jpeg",
          "age": 3,
          "breed": "Scottish Terrier",
          "location": "Tooleville, West Virginia"
        },
        {
          "id": 2,
          "name": "Collins",
          "picture": "images/french-bulldog.jpeg",
          "age": 2,
          "breed": "French Bulldog",
          "location": "Freeburn, Idaho"
        },
        {
          "id": 3,
          "name": "Melissa",
          "picture": "images/boxer.jpeg",
          "age": 2,
          "breed": "Boxer",
          "location": "Camas, Pennsylvania"
        },
        {
          "id": 4,
          "name": "Jeanine",
          "picture": "images/french-bulldog.jpeg",
          "age": 2,
          "breed": "French Bulldog",
          "location": "Gerber, South Dakota"
        },
        {
          "id": 5,
          "name": "Elvia",
          "picture": "images/french-bulldog.jpeg",
          "age": 3,
          "breed": "French Bulldog",
          "location": "Innsbrook, Illinois"
        },
        {
          "id": 6,
          "name": "Latisha",
          "picture": "images/golden-retriever.jpeg",
          "age": 3,
          "breed": "Golden Retriever",
          "location": "Soudan, Louisiana"
        },
        {
          "id": 7,
          "name": "Coleman",
          "picture": "images/golden-retriever.jpeg",
          "age": 3,
          "breed": "Golden Retriever",
          "location": "Jacksonwald, Palau"
        },
        {
          "id": 8,
          "name": "Nichole",
          "picture": "images/french-bulldog.jpeg",
          "age": 2,
          "breed": "French Bulldog",
          "location": "Honolulu, Hawaii"
        },
        {
          "id": 9,
          "name": "Fran",
          "picture": "images/boxer.jpeg",
          "age": 3,
          "breed": "Boxer",
          "location": "Matheny, Utah"
        },
        {
          "id": 10,
          "name": "Leonor",
          "picture": "images/boxer.jpeg",
          "age": 2,
          "breed": "Boxer",
          "location": "Tyhee, Indiana"
        },
        {
          "id": 11,
          "name": "Dean",
          "picture": "images/scottish-terrier.jpeg",
          "age": 3,
          "breed": "Scottish Terrier",
          "location": "Windsor, Montana"
        },
        {
          "id": 12,
          "name": "Stevenson",
          "picture": "images/french-bulldog.jpeg",
          "age": 3,
          "breed": "French Bulldog",
          "location": "Kingstowne, Nevada"
        },
        {
          "id": 13,
          "name": "Kristina",
          "picture": "images/golden-retriever.jpeg",
          "age": 4,
          "breed": "Golden Retriever",
          "location": "Sultana, Massachusetts"
        },
        {
          "id": 14,
          "name": "Ethel",
          "picture": "images/golden-retriever.jpeg",
          "age": 2,
          "breed": "Golden Retriever",
          "location": "Broadlands, Oregon"
        },
        {
          "id": 15,
          "name": "Terry",
          "picture": "images/golden-retriever.jpeg",
          "age": 2,
          "breed": "Golden Retriever",
          "location": "Dawn, Wisconsin"
        }
      ];      
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    //});

    return App.initWeb3();
  },

  initWeb3: function() {

    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7892');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
    
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
    
      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
    
        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
