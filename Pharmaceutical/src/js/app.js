App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    $.getJSON('../sell.json', function(data) {
      var sellRow = $('#sellRow');
      var sellTemplate = $('#sellTemplate');


      sellTemplate.find('.panel-title').text(data[0].name);

      sellRow.append(sellTemplate.html());

    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
	if (window.ethereum) {
	  App.web3Provider = window.ethereum;
	  try {
	    // Request account access
	    await window.ethereum.enable();
	  } catch (error) {
	    // User denied account access...
	    console.error("User denied account access")
	  }
	}
	// Legacy dapp browsers...
	else if (window.web3) {
	  App.web3Provider = window.web3.currentProvider;
	}
	// If no injected web3 instance is detected, fall back to Ganache
	else {
	  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
	}
	web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
	  $.getJSON('Pharma.json', function(data) {
	  // Get the necessary contract artifact file and instantiate it with truffle-contract
	  var PharmaArtifact = data;
	  App.contracts.Pharma = TruffleContract(PharmaArtifact);

	  // Set the provider for our contract
	  App.contracts.Pharma.setProvider(App.web3Provider);

	  return App.markPurchase();
	});

    return App.bindEvents();
  },


  bindEvents: function() {
    $(document).on('click', '.btn-purchase', App.handlePurchase);
    $(document).on('click', '.btn-create', App.handleCreate);
    $(document).on('click', '.btn-view', App.viewHistory);
  },

  markPurchase: function(buyers, account) {
	var purchaseInstance;

	App.contracts.Pharma.deployed().then(function(instance) {
	  purchaseInstance = instance;

	  return purchaseInstance.getManufactuers.call();
	}).then(function(buyers) {
	  for (i = 0; i < buyers.length; i++) {
	    if (buyers[i] !== '0x0000000000000000000000000000000000000000') {
	      $('.panel-drug').eq(i).find('button').text('Success').attr('disabled', true);
	    }
	  }
	}).catch(function(err) {
	  console.log(err.message);
	});

  },

  handlePurchase: function(event) {
    event.preventDefault();
	console.log("as");
var Address = document.getElementById("rcvAddr").value;
var serialNo = document.getElementById("txnSerial").value;
    var serialId = parseInt($(event.target).data('id'));
	//
	var purchaseInstance;

	web3.eth.getAccounts(function(error, accounts) {
	  if (error) {
	    console.log(error);
	  }

	  var account = accounts[0];

	  App.contracts.Pharma.deployed().then(function(instance) {
	    purchaseInstance = instance;

	    // Execute transaction by sending account
	    return purchaseInstance.transact(Address, serialNo);
	  }).then(function(result) {
	    return App.markPurchase();
	  }).catch(function(err) {
	    console.log(err.message);
	  });
	});

  },
  viewHistory: async function(){
	    var pharmaInstance;
	App.contracts.Pharma.deployed().then(function(instance) {
	  pharmaInstance = instance;
	  var RcvEvent = pharmaInstance.allEvents({ fromBlock: 0, toBlock: 'latest' });
RcvEvent.get((error,events) => {
		if (error)
			console.log("error getting events: " + error);
		else
                        console.log(events);
	});
	})
  },

  handleCreate: function(event){
	event.preventDefault();

	if (document.getElementById("product").value != "" && document.getElementById("serial").value != ""){
		var productID = document.getElementById("product").value;
		var serialNo = document.getElementById("serial").value;
	var createInstance;
	// get user's accounts
	web3.eth.getAccounts(function(error, accounts) {
	  if (error) {
	    console.log(error);
	  }
	  var account = accounts[0];
	  
	  App.contracts.Pharma.deployed().then(function(instance){
		createInstance = instance;
		// Create information
		return createInstance.create(productID, serialNo);

	}).then(function(result) {
		console.log("done");
		//return App.markCreated();
	}).catch(function(err) {
		console.log(err.message);
	});
	});
	}else
	  console.log("Fill in the required fields");
  },
  handleView: function(event){
	event.preventDefault();
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
