"use strict"

var modelController = (function() {

  var data = {
    resultsSet: [],
    leaderBoard: {},
    pot: 0
  };
  var createLeaderBoard = function() {
    //use reduce to accumulate scores, because its awesome 
    var completeLeaderBoard = data.resultsSet.reduce(function(leaderBoard, item) {
              
             Object.keys(item).forEach(function(ele){
                 if(leaderBoard[ele]) { // handle empty fields
                   leaderBoard[ele] =  item[ele] === "" ? parseInt(leaderBoard[ele],10) :  parseInt(leaderBoard[ele],10) + parseInt(item[ele],10); 
                 } else {
                   leaderBoard[ele] = item[ele] === "" ? 0 : parseInt(item[ele],10); 
                 }
                      
             }); 
              
             return leaderBoard;    
        
       }, {});

       //sort, chuck out the non players and set the pot

       //this would look nicer in es6...
       data.leaderBoard = Object.entries(completeLeaderBoard).filter(function(item) {
            if  (item[0] != 'POT' && item[0] != '#' ) {
                return item;
            } else if (item[0] === 'POT') {
                data.pot = item[1]; //set the pot while we are here...
            }
       }).sort(function (x, y) {return y[1] - x[1];});


  }

  return {
      storeSheet: function(sheet) {
          data.resultsSet = sheet;
          createLeaderBoard();
      },
      getResultSet: function() {return data.resultsSet;},
      getLeaderBoard: function() {return data.leaderBoard},
      getPotTotal: function() {return data.pot}
  }
})();

var viewController = (function() {

  var createLBHeadings = function() {
    
        var thead, hrow, cell, textNode;
    
        thead = document.createElement('thead');
        hrow = document.createElement('tr');

        textNode = document.createTextNode("Pos");
        cell = document.createElement('th');
        cell.appendChild(textNode);
        hrow.appendChild(cell);

        textNode = document.createTextNode("Player");
        cell = document.createElement('th');
        cell.appendChild(textNode);
        hrow.appendChild(cell);

        textNode = document.createTextNode("Points");
        cell = document.createElement('th');
        cell.appendChild(textNode);
        hrow.appendChild(cell);
        
        return thead.appendChild(hrow);
    
  };

  var createLBBody = function(leaderBoard) {
    
        var tableBody, row, cell;
    
        tableBody = document.createElement('tbody');
    
        leaderBoard.forEach(function(item, index) {
          
            row = document.createElement('tr');

            cell = document.createElement('td');
            cell.appendChild(document.createTextNode(index + 1));
            row.appendChild(cell);

            cell = document.createElement('td');
            cell.appendChild(document.createTextNode(item[0]));
            row.appendChild(cell);

            cell = document.createElement('td');
            cell.appendChild(document.createTextNode(item[1]));
            row.appendChild(cell);
    
          tableBody.appendChild(row);
        });
    
        return tableBody;
    
  };

  var createHeadings = function(headingRow) {

    var thead, hrow, cell, textNode;

    thead = document.createElement('thead');
    hrow = document.createElement('tr');
   
     //Dynamically get headers
    Object.keys(headingRow).map(function(value, key){
      textNode = document.createTextNode(value);
      cell = document.createElement('th');
      cell.appendChild(textNode);
      hrow.appendChild(cell);
    });

    return thead.appendChild(hrow);

  };

  var addRainCloudSymbol = function () {

    var element = document.createElement('i');
    element.classList.add('wi','wi-sleet');
    element.setAttribute('aria-hidden','true');

    return element;

  };

  var createBody = function(resultSet) {

    var tableBody, row, cell;
    var zeroScore = "0";

    tableBody = document.createElement('tbody');

    resultSet.forEach(function(rowData) {
      
        row = document.createElement('tr');

        for (var property in rowData) {
          cell = document.createElement('td');
          if (rowData.hasOwnProperty(property)) {

            if(rowData[property] === zeroScore && property != 'POT') {

              cell.appendChild(addRainCloudSymbol());

            } else {
              cell.appendChild(document.createTextNode(rowData[property]));
            }

            row.appendChild(cell);
          }
        }

      tableBody.appendChild(row);
    });

    return tableBody;

  };

  return {
     createResultsTable: function(resultSet) {
      var table
    
      table = document.createElement('table');
      table.classList.add('table','table-responsive','table-sm');
  
      table.appendChild(createHeadings(resultSet[0]));
  
      table.appendChild(createBody(resultSet));

      document.querySelector('.edExResults').insertAdjacentElement('beforeend',table); 
      
    },
    createLeaderBoard: function(leaderBoard) {
      var table

      table = document.createElement('table');
      table.classList.add('table','table-responsive','table-sm');
  
      table.appendChild(createLBHeadings());
  
      table.appendChild(createLBBody(leaderBoard));

      document.querySelector('.edExLeaderboard').insertAdjacentElement('beforeend',table);
      
    },
    addPotTotal: function(pot) {

      document.querySelector('#pot-label').textContent = pot;

    },
    showSectionUsingClass: function(cssClass, showSection) {
      if(showSection) {
        document.querySelector(cssClass).style.display = "block";
      } else {
        document.querySelector(cssClass).style.display = "none";
      }
    }

  }


})();

var appController = (function(modelCtlr, viewCtrl) {
  var _publicSpreadsheetKey = '1zPNsfujwO1zViheYurPNNxMXwcA5gGWa3lcnpr4eWKc';

  var setUpEventListers = function() {

    window.addEventListener('DOMContentLoaded', domLoaded);
 
  };

  var domLoaded = function() {
    //wait until client tells us dom has loaded
    Tabletop.init({key: _publicSpreadsheetKey, callback: showTableInfo, simpleSheet: true});

    $('.navbar-nav>li>a').on('click', function(){
      $('.navbar-collapse').collapse('hide');
    });

    window.addEventListener('scroll', onWindowScrolling);
    document.querySelector('.back-to-top').addEventListener('click', function() {
      document.body.scrollTop = 0; // For Chrome, Safari and Opera 
      document.documentElement.scrollTop = 0; // For IE and Firefox
    });

  };

  var onWindowScrolling = function() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      document.querySelector('.back-to-top').style.display = "block";
      } else {
      document.querySelector('.back-to-top').style.display = "none";
      }
  };

  var showTableInfo = function(data, tabletop) {

    if(data === null || data === undefined) {
        console.log('Oh dear, google must be down...'); 
        viewCtrl.showSectionUsingClass('.spinny-loady-thing',false); //hide spinner
    } else {
        viewCtrl.showSectionUsingClass('.spinny-loady-thing',false); //hide spinner
        modelCtlr.storeSheet(data);
        console.log(data);
        viewCtrl.createResultsTable(modelCtlr.getResultSet());
        viewCtrl.createLeaderBoard(modelCtlr.getLeaderBoard());
        viewCtrl.addPotTotal(modelCtlr.getPotTotal());
        viewCtrl.showSectionUsingClass('.main-content',true); //show main content
    }
 
  };

  //public methods
  return {
    init: function() {
      console.log('App running');
      setUpEventListers();      
    }

  }

})(modelController, viewController);

appController.init();




