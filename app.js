
  
(function(){
'use strict'

let dv4app = angular.module('NarrowItDown',[
    
]);


dv4app
    .constant('menuServiceURL','https://davids-restaurant.herokuapp.com/menu_items.json')


dv4app
    .controller('NarrowItDownCtrl',[
        //dependencies
        '$scope','$q','MenuSearchService',
        //main function
        narrowItDown
    ]);

function narrowItDown(scope,$q,searchService){
    let ctrl = this;

    //init searchTerm 
    ctrl.searchTerm="";
    //define empty array
    ctrl.showCount=false; 
    //ctrl.found=[];
    //get items 
    ctrl.getMatchedMenuItems = function(){
        console.log("Fetch items...");
        if (ctrl.searchTerm==""){
            //return empty array 
            ctrl.found=[];
        }else{
            //async
            searchService.getMatchedMenuItems(ctrl.searchTerm)
            .then((data)=>{
                
                ctrl.found = data; 
            }).catch((err)=>{
               
                ctrl.found=[];
                
                console.error(err);
            });
        }
       
        ctrl.showCount=true;
    };

    
    ctrl.removeItem = function(itemId){

        if (ctrl.found.length>0){
            //remove item 
            ctrl.found.splice(itemId,1)
            //log 
            console.log("Removed item...", itemId);
        }
    }
}


dv4app
    .service('MenuSearchService',[
        //dependencies
        '$http','$q','menuServiceURL',
        menuSearchService
    ]);

function menuSearchService($http,$q,menuServiceURL){
    let serv = this;

    
    serv.getMatchedMenuItems=function(searchTerm){
        let filtered=[],
            q = $q.defer(); 
        //check cache
        if (serv.allItems){            
            filtered = filterItems(searchTerm);
            //return filtered;
            q.resolve(filtered);
        }else{
            //perform http request
            $http({
                method:"GET",
                url: menuServiceURL
            }).then((resp)=>{
               
                serv.allItems = resp.data.menu_items;
               
                filtered = filterItems(searchTerm);
                
                q.resolve(filtered);
            }).catch((err)=>{
               
                console.error(err);
                
                q.reject(err);
            });
        }; 
        //RETURN PROMISE
        return q.promise;       
    };

    function filterItems(searchTerm){
        let filtered=[];
        console.log("Search for items with...", searchTerm)

        filtered = serv.allItems.filter((item)=>{
            return item.description.indexOf(searchTerm.toLowerCase()) > -1;
        });

        return filtered;
    };
};


dv4app
    .directive('foundItems',[
       
        foundItems
    ]);

function foundItems(){
    let dir = {
        scope:{
            menuItems:'<',
            onRemove:'&'
        },
        template:` 
            <table class="table table-striped">
                <tr data-ng-repeat="item in ctrl.menuItems">
                    <td>{{item.short_name}}</td>
                    <td>{{item.name}}</td>
                    <td>{{item.description}}</td>
                    <td style="text-align:right;"> 
                        <button 
                            data-ng-click="ctrl.removeItem($index)"
                            class="btn"
                            title="Don't want thisone"
                        ><i class="glyphicon glyphicon-remove"></i></button>
                    </td> 
                </tr>
            </table>
        `,
        controller:foundItemsDirCtrl,
        //bind controller function to local
        controllerAs:'ctrl',
        bindToController:true 
    };

    return dir;
};

function foundItemsDirCtrl(){
    let ctrl=this;

   
    ctrl.removeItem = function(itemId){

        console.log("Remove item...",itemId);
        
        ctrl.onRemove({
            id:itemId 
        })
    }
};

})()

