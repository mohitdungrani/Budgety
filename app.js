//budget controler
 var budgetControler = (function(){
     var Income = function(ID,description,value){
        this.ID = ID;
        this.description = description;
        this.value = value;
     };


     var Expence = function(ID,description,value){
        this.ID = ID;
        this.description = description;
        this.value = value;
        this.percentages = -1;
     };

     Expence.prototype.calcPercentages = function(totalIncome){
         if(totalIncome > 0){
             this.percentages = Math.round((this.value/totalIncome)*100);
         }
         else{
             this.percentages = -1;
         }

     };
     Expence.prototype.getPercentages = function(){
        return this.percentages;   
        
     };
     var calculateTotal = function(type){
         var sum = 0;
         data.allData[type].forEach(function(cur){
             sum = sum + cur.value;
         }); 
         data.total[type] = sum;
     };

     var data = {
         allData : {
             inc : [],
             exp : []
         },
         total : {
             inc : 0,
             exp : 0,
             percentage : -1
         },
         budget : 0
     };
    
     return{
         addItem : function(type,description,value){
             var newItem,ID;

             if (data.allData[type].length > 0 ){
                ID = data.allData[type][data.allData[type].length - 1].ID + 1 ;
             }
             else{
                 ID = 0;
             }
            
             if(type == 'exp'){
                newItem = new Expence(ID,description,value);
             }
             else if(type == 'inc'){
                 newItem = new Income(ID,description,value);
             }

             data.allData[type].push(newItem);
             return newItem;
         },
         calculateBudget : function(){
             calculateTotal('inc');
             calculateTotal('exp');
             data.budget = data.total['inc'] - data.total['exp'];
             if(data.total['inc'] > 0){
                data.total['percentage'] = Math.round((data.total['exp']/data.total['inc'])*100);
             }
             else{
                 data.total['percentage'] = -1;
             }                   
         },
         getBudget : function(){
            return{
                totalInc : data.total['inc'],
                totalExp : data.total['exp'],
                budget : data.budget,
                percentage : data.total['percentage'],
            };
         },
         deleteItem :function(type,ID){
            var ids;
            ids = data.allData[type].map(function(current){
                return current.ID;
            });
            index = ids.indexOf(ID);
            if(index !== -1){
                data.allData[type].splice(index,1);
            }
                
         },
         calculatePercentages : function(){
             data.allData.exp.forEach(function(cur){
                cur.calcPercentages(data.total.inc);
             });
         },
         getPercentages : function(){
             var allper = data.allData.exp.map(function(cur){
                 return cur.getPercentages();
             });
             return allper;
         },
         testing : function(){
             console.log(data);
         }
     }


 })();

 // UI controler
 var UICotroler = (function(){
     
    var getNumber = function(num,type){
        num = Math.abs(num);
        num = num.toFixed(2);
        numpart = num.split('.');
        num = numpart[0];
        dec = numpart[1];
        if(num.length >3){
            num = num.substr(0,num.length - 3) + ',' + num.substr(num.length - 3 ,num.length);
        }
        return (type == 'inc' ? '+' : '-') + ' '+ num + '.' + dec ;
     };

    return{
         getData : function(){
             return{
                type : document.querySelector('.add__type').value,
                description : document.querySelector('.add__description').value,
                value : parseFloat(document.querySelector('.add__value').value)
             };
         },
         addListItem : function(obj,type){
            var html,newHtml,element;
            if(type === 'inc'){
                element = '.income__list';
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%d%</div><div class="right clearfix">\
                    <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn">\
                    <i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else{
                element = '.expenses__list';
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%d%</div>\
                <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>\
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\
                </div></div></div>';
            }
            newHtml = html.replace('%id%', obj.ID);
            newHtml = newHtml.replace('%d%', obj.description);
            newHtml = newHtml.replace('%value%', getNumber(obj.value,type));
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

         },
         clearField : function(){
             document.querySelector('.add__description').value = "";
             document.querySelector('.add__value').value = "";
             document.querySelector('.add__description').focus();
         },
         displayBudget : function(obj){
             type = obj.budget > 0 ? 'inc' : 'exp';
             document.querySelector('.budget__value').textContent = getNumber(obj.budget,type) ;
             document.querySelector('.budget__income--value').textContent = getNumber(obj.totalInc,'inc') ;
             document.querySelector('.budget__expenses--value').textContent = getNumber(obj.totalExp,'exp');
             
             if(obj.percentage > 0){
                document.querySelector('.budget__expenses--percentage').textContent = obj.percentage + '%';
             }
             else{
                document.querySelector('.budget__expenses--percentage').textContent = '---';
             }
         },
         dislpayPer : function(per){
             var tags,tagsArr,i = 0;
            tags = document.querySelectorAll('.item__percentage');
            tagsArr = Array.prototype.slice.call(tags);
            tagsArr.forEach(function(cur){
                if(per[i] > 0){
                    cur.textContent = per[i] + '%';
                }
                else{
                    cur.textContent = '--';
                }
                
                i++;
            });
         },
         deleltListItem : function(ID){
            var el = document.getElementById(ID);
            el.parentNode.removeChild(el);
         },
         getMonth : function(){
             var now, year, month,montharr;
             montharr = ['january','February','March','April','June','July','August','Septemble','Octomber', 'December'];
             now = new Date();
             year = now.getFullYear();
             month = now.getMonth();
             document.querySelector('.budget__title--month').textContent = montharr[month] + ' ' + year;

         }
     }
})();

// Controler
var controler = (function(bCtr,uCtr){
    
    var setUpEventListener = function(){
        document.querySelector('.add__btn').addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(event){
            if(event.keyCode === 13 || event.which === 13)
            {
                ctrlAddItem();
            }
        document.querySelector('.container').addEventListener('click',ctrlDeleteItem);
            
        });
    };
    
    var updateBudget = function(){
        bCtr.calculateBudget();
        budget = bCtr.getBudget();
        uCtr.displayBudget(budget);
    }
    
    var ctrlAddItem = function(){
          var input,newItem;
          input =  uCtr.getData();

          if(input.description !== "" && !isNaN(input.value) && input.value >0){
            newItem = bCtr.addItem(input.type,input.description,input.value);
            uCtr.addListItem(newItem,input.type);
            uCtr.clearField();
            updateBudget();
            ctrlPercentages();
          }        
     };
     var ctrlDeleteItem = function(event){
        var itemId,arr,type,ID;  
        itemId = (event.target.parentNode.parentNode.parentNode.parentNode.id);
        if(itemId){
            arr = itemId.split('-');
            type = arr[0];
            ID = parseInt(arr[1]);
            bCtr.deleteItem(type,ID);
            uCtr.deleltListItem(itemId);
            updateBudget();
            ctrlPercentages();
        }
    };
    var ctrlPercentages = function(){
        var percentages;
        bCtr.calculatePercentages();
        percentages = bCtr.getPercentages();
        uCtr.dislpayPer(percentages);
        
    };

     return{
            init :function(){
            console.log('Application is started');
            uCtr.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : 0
            });
            uCtr.getMonth();
            setUpEventListener();
        }
     };
})(budgetControler,UICotroler);

controler.init();