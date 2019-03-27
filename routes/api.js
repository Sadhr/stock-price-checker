/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;


const StockHandler = require('../controllers/stockHandler.js');



module.exports = function (app) {
  
  const stockPrice = new StockHandler();
  
  app.route('/api/stock-prices/')
    .get(function (req, res){
      
      const headers = req.headers;
      const stock   = req.query.stock;
      const like    = req.query.like || false;
      const ip      = req.connection.remoteAddress;
      let stockData = null;
      let likeData  = null;
      let multiple  = false;
    
      if(Array.isArray(stock)){
        stockData = [];
        likeData  = [];
        multiple  = true;
      }
      
      const sync = (finished, data) => {
        if(finished === 'stockData'){
          multiple ? stockData.push(data) : stockData = data;
        }else{
          multiple ? likeData.push(data) : likeData = data;
        }
        
        if(!multiple && stockData && likeData !== null){
          stockData.stockData.likes = likeData.likes;
          res.json(stockData);
        }else if(multiple && stockData.length === 2 && likeData.length === 2){
          if(stockData[0].stock === likeData[0].stock){
            console.log(stockData[0]);
            stockData[0].stockData.rel_likes = likeData[0].likes - likeData[1].likes;
            stockData[1].stockData.rel_likes = likeData[1].likes - likeData[0].likes;
          }else{
            console.log(stockData[0]);
            stockData[1].stockData.rel_likes = likeData[1].likes - likeData[0].likes;
            stockData[0].stockData.rel_likes = likeData[0].likes - likeData[1].likes;
          }
          res.json({stockData});
        }
      }
      
      if(multiple){
        stockPrice.getData(stock[0], sync);
        stockPrice.getLike(stock[0], like, ip, sync);
        stockPrice.getData(stock[1], sync);
        stockPrice.getLike(stock[1], like, ip, sync);
      }else{
        stockPrice.getData(stock, sync);
        stockPrice.getLike(stock, like, ip, sync);
      }
    
    });
    
};
