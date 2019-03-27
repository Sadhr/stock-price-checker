const request     = require('request');
const MongoClient = require('mongodb');


const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

function stockHandler () {
  
  this.getData = (stock, cb) => {
    
    const token  = process.env.STOCK_URI;
    const apiUri = `https://cloud.iexapis.com/beta/stock/${stock}/quote?token=${token}`;  
    
    request(apiUri, (err, res, body) => {
      if(!err && res.statusCode === 200){
        const data   = JSON.parse(body); 
        cb('stockData', {stockData: {stock: data.symbol, price: data.latestPrice}});
      }else{
        console.log("Error occurred");
        cb('stockData', 'external source error');
      }
    
    });
    
  };
  
  this.getLike = (stock, like, ip, cb) => {
    MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
      const collection = client.db().collection('stock_likes');
      
      if(!like){
        collection.find({stock: stock})
                  .toArray((err, doc) => {
                    let likes = 0;
                    if(doc.length > 0){
                      likes = doc[0].likes.length;
                    }
                    cb('likeData', {stock: stock, likes: likes});
                  });
      }else{
        collection.findAndModify(
          { stock: stock },
          [],
          { $addToSet: { likes: ip } },
          { new: true, upsert: true },
          (err, doc) => {
            cb('likeData', { stock: stock, likes: doc.value.likes.length });
          }
        );
      }
      
    });
  };
  
}

module.exports = stockHandler;