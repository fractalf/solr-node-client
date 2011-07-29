// Dependencies 
var solr = require('./../lib/solr'),
   vows = require('vows'),
   assert = require('assert');

// Suite Test

var suite = vows.describe('Solr Client API');

suite.addBatch({
   'The creation of a Solr Client' : {
      'with no options' : {
         topic : function() {
            var client = solr.createClient();
            return client;
         },
         'should return a `Client`' : function(client){
            assertClient(client);
         }
      },
      'with custom host, post, core and path' : {
         topic : function(){
            var host = 'localhost';
            var port = 8983;
            var core = '';
            var path = '/solr';
            var client = solr.createClient(host,port,core,path);
            return client
         },
         'should return a `Client`' : function(client){
            assertClient(client);
         }
      }
   }
}).addBatch({
   'Adding' : {
      topic : function(){
         var client = solr.createClient();
         return client;
      },
      'one document to the Solr DB': {
         topic : function(client){
            var doc = { 
               id : 1234567890,
               title_t : 'Test title',
               description_t : 'Test Description' 
            };
            client.add(doc,this.callback);  
         },
         'should be possible.' : function(res,err){
            assertCorrectResponse(res,err);
         }
      },
      'several documents to the Solr DB' : {
         topic : function(client){
            client.updateEach = 4;
            for(var i = 0; i < 5; i++){
               var doc = { 
                  id : 1234567891 + i,
                  title_t : 'Test title ' + i,
                  description_t : 'Test Description' + i 
               };
               client.add(doc,this.callback);
            }
            client.purgeAdd(this.callback);
         },
         'should be possible' : function(res,err){
            assertCorrectResponse(res,err);
         }
      }
   }
}).addBatch({
   'Committing' : {
      topic : function(){
         var client = solr.createClient();
         return client;
      },
      'manually' : {
         topic : function(client){
            client.autoCommit = false;
            client.commit(this.callback);
         },
         'should be possible' : function(res,err){
            assertCorrectResponse(res,err);
         }
      },
      'automatically' : {
         topic : function(client){
            client.autoCommit = true;
            return client;
         },
         'should be possible' : function(client){
            assert.equal(client.autoCommit,true);
         }
      }
   }
}).addBatch({
   'Deleting' : {
      topic : function(){
         var client = solr.createClient();
         return client;
      },
      'a document by ID' : {
         topic : function(client){
            client.deleteByID(1234567890,this.callback);
         },
         'should be possible' : function(res,err){
            assertCorrectResponse(res,err);
         }
      },
      'a document with a query' : {
         topic : function(client){
            client.delete('title_t' , 'Test title', this.callback);
         },
         'should be possible' : function(res,err){
            assertCorrectResponse(res,err);
         }
      }
   }
}).addBatch({
   'Optimizing' : {
      topic : function(){
         var client = solr.createClient();
         return client;
      },
      'the Solr Database' : {
         topic : function(client){
            var options = {
               waitFlush: true ,
               waitSearcher: true
            };
            client.optimize(options,this.callback);
         },
         'should be possible' : function(res,err){
            
         }
      }
   }
}).addBatch({
   'Updating' : {
      topic : function(){
         var client = solr.createClient();
         return client;
      },
      'the Solr Database with any object' : {
         topic : function(client){
            var data = { rollback : {} };
            client.update(data,this.callback);
         },
         'should be possible' : function(res,err){
            assertCorrectResponse(res,err);
         }
      } 
   }
}).addBatch({
   'Rolling back' : {
      topic : function(){
         var client = solr.createClient();
         return client;
      },
      'all documents added or deleted to the index since the last commit' : {
         topic : function(client){
            client.rollback(this.callback);
         },
         'should be possible' : function(res,err){
            assertCorrectResponse(res,err);
         }
      }
   }
}).addBatch({
   'Querying' : {
      topic : function(){
         var client = solr.createClient();
         return client;
      },
      'nicely with DisMaxParserPlugin the Solr Database' : {
         topic : function(client){
            var query = client.createQuery().q('laptop').dismax().qf({title_t : 0.2 , description_t : 3.3}).mm(2).start(0).rows(10);
            client.query(query,this.callback);
         },
         'should be possible' : function(res,err){
            assertCorrectResponse(res,err);
         }
      },
      'simply with DefaultRequestHandler the Solr Database' : {
         topic : function(client){
            var query = client.createQuery().q({title_t : 'laptop'}).start(0).rows(10);
            client.query(query,this.callback);
         },
         'should be possible' : function(res,err) {
            assertCorrectResponse(res,err);
         }
      }
   }
}).export(module);

// Macros

function assertClient(client){
    assert.isFunction(client.add);
    assert.isFunction(client.purgeAdd);
    assert.isFunction(client.commit);
    assert.isFunction(client.delete);
    assert.isFunction(client.deleteByID);
    assert.isFunction(client.optimize);
    assert.isFunction(client.update);
    assert.isFunction(client.query);
}

function assertCorrectResponse(res,err){
   var obj = JSON.parse(res);
   assert.isObject(obj);
   assert.equal(obj.responseHeader.status,0);
   assert.isUndefined(err);
}
