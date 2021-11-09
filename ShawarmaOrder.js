const Order = require("./Order");

const OrderState = Object.freeze({
    WELCOMING:   Symbol("welcoming"),
    SIZE:   Symbol("size"),
    TOPPINGS:   Symbol("toppings"),
    DRINKS:  Symbol("drinks"),
    PAYMENT: Symbol("payment")
});

module.exports = class ShwarmaOrder extends Order{
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.sItem = "";
        this.sSize = "";
        this.sToppings = "";
        this.sOthers = "";
        this.sPrice= 0;
    }

    handleInput(sInput){
        let aReturn = [];
        switch(this.stateCur){
            case OrderState.WELCOMING:
                this.stateCur = OrderState.ITEM;
                aReturn.push("Welcome to Rasi's Food Mart");
                aReturn.push("Please select the item");
                aReturn.push("1. Pizza");
                aReturn.push("2. Shawarma");
                aReturn.push("3. Sandwich");
                break;
            case OrderState.ITEM:
              sInput = sInput.toLowerCase();
              if (sInput == '1' || sInput.toLowerCase() == 'pizza') {
                  this.stateCur = OrderState.SIZE;
                  this.sItem = 'Pizza';
                  this.sPrice = 17;
                  aReturn.push("What size would you like?");
              } else if (sInput == '2' || sInput.toLowerCase() == 'shawarma') {
                  this.stateCur = OrderState.SIZE;
                  this.sItem = 'Shawarma';
                  this.sPrice = 11;
                  aReturn.push("What size would you like?");
              } else if (sInput == '3' || sInput.toLowerCase() == 'sandwich') {
                  this.stateCur = OrderState.SIZE;
                  this.sItem = 'Sandwich';
                  this.sPrice = 14;
                  aReturn.push("What size would you like?");
              }
              else {
                  this.stateCur = OrderState.ITEM;
                  aReturn.push("Please enter valid option");

              }
              break;
              case OrderState.SIZE:
                this.sSize = sInput.toLowerCase();
               
                if (sInput.toLowerCase() == 'large' ||sInput.toLowerCase() == 'l') {
                    this.stateCur = OrderState.TOPPINGS
                    this.sPrice = this.sPrice + 7;
                    aReturn.push("What toppings would you like?");
                }
                else if (sInput.toLowerCase() == 'medium' ||sInput.toLowerCase() == 'm') {
                    this.stateCur = OrderState.TOPPINGS
                    this.sPrice = this.sPrice + 5;
                    aReturn.push("What toppings would you like?");
                }
                else  if (sInput.toLowerCase() == 'small' ||sInput.toLowerCase() == 's'){
                    this.stateCur = OrderState.TOPPINGS
                    this.sPrice = this.sPrice + 2;
                    aReturn.push("What toppings would you like?");
                }
                else{
                    this.stateCur = OrderState.SIZE;
                    aReturn.push("Please enter valid option");
                }
                break;
            case OrderState.TOPPINGS:
               this.stateCur = OrderState.DRINKS
               this.sToppings = sInput;
               aReturn.push("Would you like with?");
               aReturn.push("1. Drinks ");
               aReturn.push("2. Beverages");
               aReturn.push("3. Desserts");
               break;
            case OrderState.DRINKS:
                this.stateCur = OrderState.PAYMENT;
                this.isDone(true);
                if(sInput.toLowerCase() != "no"){
                  switch(sInput){
                    case '1':
                    case sInput.toLowerCase() == 'drinks':
                        this.sOthers = 'Drinks';
                        this.sPrice = this.sPrice + 4;
                        break;
                    case '2':
                    case sInput.toLowerCase() == 'beverages':
                        this.sOthers = 'Beverages';
                        this.sPrice = this.sPrice + 7;
                        break;
                    case '3':
                    case sInput.toLowerCase() == 'desserts':
                        this.sOthers = 'Desserts';
                        this.sPrice = this.sPrice + 9;
                        break;    
                  }
                }
                else{
                    this.sOthers = 'no drink';
                    this.sPrice = 0;  
                }
                aReturn.push('**************************');
                aReturn.push("Thank-you for your order of");
                aReturn.push(`${this.sSize} ${this.sItem} with ${this.sToppings}`);
                if(this.sOthers){
                    aReturn.push(this.sOthers);
                }
                aReturn.push(`Total Order Price: $ ${this.sPrice}`);
                aReturn.push(`***********************`);
                aReturn.push(`Please pay for your order here`);
                aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
                break;
            case OrderState.PAYMENT:
                console.log(sInput);
                this.isDone(true);
                let d = new Date();
                d.setMinutes(d.getMinutes() + 20);
                aReturn.push(`Your order will be delivered at ${d.toTimeString()}`);
                aReturn.push(`To the below Address:`);
                aReturn.push(sInput.purchase_units[0].shipping.address.address_line_1);
                aReturn.push(sInput.purchase_units[0].shipping.address.address_line_2);
                aReturn.push(sInput.purchase_units[0].shipping.address.postal_code);
                aReturn.push(sInput.purchase_units[0].shipping.address.country_code);
                break;
        }
        return aReturn;
    }
    renderForm(sTitle = "-1", sAmount = "-1"){
      // your client id should be kept private
      if(sTitle != "-1"){
        this.sItem = sTitle;
      }
      if(sAmount != "-1"){
        this.nOrder = sAmount;
      }
      const sClientID = process.env.SB_CLIENT_ID || 'AcU6q4qIfyp_v0PUWL6b2x1I2uTw3qgWeraoVV_O3AvEyaU7sD34-uTDaPvGkLvKQnteriwMn_tNXi_S'
      return(`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your <strong> ${this.sItem} </strong> order of $${this.sPrice}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.sPrice}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);
  
    }
}