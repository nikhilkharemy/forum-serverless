var mysql  = require('mysql');

var connection = mysql.createConnection({
    host     : 'stag-wahcricket.cqnwvxrxwjzo.ap-south-1.rds.amazonaws.com',
    user     : 'stag-wahcricket',
    password : 'stag-wahcricket123',
    database : 'abpmanch'
  });


exports.handler = function(event, context) {
	
	
	/* Begin transaction */
	connection.beginTransaction(function(err) {
	  if (err) { throw err; }
	  topic_insert_query = getTopicInsertQuery(event);
	  connection.query(topic_insert_query, function(err, result) {
		if (err) { 
		  connection.rollback(function() {
			throw err;
		  });
		}
	 
		var log = result.insertId;
	 
		connection.query('INSERT INTO log SET logid=?', log, function(err, result) {
		  if (err) { 
			connection.rollback(function() {
			  throw err;
			});
		  }  
		  connection.commit(function(err) {
			if (err) { 
			  connection.rollback(function() {
				throw err;
			  });
			}
			console.log('Transaction Complete.');
			connection.end();
		  });
		});
	  });
	});
	/* End transaction */
}

function convertToSlug(Text)
{
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}

function getTopicInsertQuery(event){
	var sql_insert_topic = 'INSERT INTO topic(eng_title, is_featured, cat_id, topic_slug, tags, referer_id, followers, views, status,modified_date, modified_by, created_date, created_by) VALUES ';
	slug = convertToSlug(connection.escape(event.english_title));
	datetime = new Date();
	logged_in_user_id = connection.escape(event.user_id);
	
	sql_insert_topic = sql_insert_topic + '(';
	sql_insert_topic = sql_insert_topic + connection.escape(event.english_title) +',';
	sql_insert_topic = sql_insert_topic + '0' + ',';
	sql_insert_topic = sql_insert_topic + connection.escape(event.cat_id) +',';
	sql_insert_topic = sql_insert_topic + slug + ',';
	sql_insert_topic = sql_insert_topic + connection.escape(event.tags)+',';
	sql_insert_topic = sql_insert_topic + connection.escape(event.referer_id)+',';
	sql_insert_topic = sql_insert_topic + '0' + ',';
	sql_insert_topic = sql_insert_topic + '0' + ',';
	sql_insert_topic = sql_insert_topic + '1' + ',';
	sql_insert_topic = sql_insert_topic +  datetime	 +',';
	sql_insert_topic = sql_insert_topic + logged_in_user_id+',';
	sql_insert_topic = sql_insert_topic + datetime +',';
	sql_insert_topic = sql_insert_topic + logged_in_user_id +')';
	
	return sql_insert_topic;
}
