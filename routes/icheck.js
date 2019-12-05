module.exports = function(app, conn, upload) {
  var express = require('express');
  var router = express.Router();
  var category = require('../lib/category.js');

  /* 목록 */
  router.get('/', (req, res) => {
    var selectedCategory = req.query.category;
    if (!selectedCategory) {
      selectedCategory = "";
    }

    category.get(conn, function(categoryList) {

      var sql = "SELECT a.*, c.title as `category_title` "
                + "FROM feed a "
                + "INNER JOIN category c on a.category = c.id "
      var sqlParam = []

      if (selectedCategory) {
        sql += "WHERE a.category = ? "
        sqlParam.push(selectedCategory);
      }

      conn.query(sql, sqlParam, function(err, feed, fields){
        if(err){
          res.status(500).send('Internal Server Error: ' + err);
        } else {
          res.render('icheck/index', {
            feed:feed,
            category: categoryList,
            selectedCategory: selectedCategory
          });
        }
      });
    });
  });

  /* 추가 */
  router.get('/add', (req, res) => {
    category.get(conn, function(categoryList) {
      res.render('icheck/add', {  
        category: categoryList
      });
    });
  });

  /* Form 데이터 DB INSERT */
  router.post('/add', upload.single('upload'), (req, res) => {
    var title = req.body.title;
    var category = req.body.category;
    var desc = req.body.desc;
    var author = req.body.author;
    var upload = req.file.filename;

    var sql = 'INSERT INTO feed (`title`, `category`, `desc`, `author`, `upload`, `inserted`) VALUES(?, ?, ?, ?, ?, now())';
    conn.query(sql, [title, category, desc, author, upload], function(err, result, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);
      } else {
        res.redirect('/icheck/' + result.insertId);
      }
    });
  });

  /* 수정 */
  router.get('/:id/edit', (req, res) => {
    var id = req.params.id;

    category.get(conn, function(categoryList) {
      var sql = "SELECT a.*, c.title as `category_title` "
                + "FROM feed a "
                + "INNER JOIN Category c on a.category = c.id "
                + "WHERE a.id=?";

      conn.query(sql, [id], function(err, feed, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error: ' + err);
        } else {
          res.render('icheck/edit', {feed:feed[0], category: categoryList});
        }
      });
    });
  });

  /* Form 데이터 DB UPDATE */
  router.post('/:id/edit', upload.single('upload'), (req, res) => {
    var id = req.params.id;
    var category = req.body.category;
    var title = req.body.title;
    var desc = req.body.desc;
    var author = req.body.author;

    if (typeof req.file !== 'undefined') {
      var sql = 'UPDATE feed SET title = ?, `category` = ?, `desc`= ?, `author` = ?, `updated` = now(), `upload` = ? WHERE id = ?;';
      var sqlParam = [title, category, desc, author, req.file.filename, id]
    } else {
      var sql = 'UPDATE feed SET title = ?, `category` = ?, `desc`= ?, `author` = ?, `updated` = now() WHERE id = ?;';
      var sqlParam = [title, category, desc, author, id]
    }

    conn.query(sql, sqlParam, function(err, result, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);
      } else {
        res.redirect('/icheck/' + id);
      }
    });
  });

  /* Delete confirmation */
  router.get('/:id/delete', (req, res) => {
    var id = req.params.id;
    var sql = 'SELECT * FROM feed WHERE id=?';
    conn.query(sql, [id], function(err, feed, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);
      } else {
        res.render('icheck/delete', {feed:feed[0]});
      }
    });
  });

  /* DELETE DB row */
  router.post('/:id/delete', (req, res) => {
    var id = req.params.id;

    var sql = 'DELETE FROM feed WHERE id = ?';
    conn.query(sql, [id], function(err, result, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);
      } else {
        res.redirect('/icheck/');
      }
    });
  });

  /* 상세보기 */
  router.get('/:id', (req, res) => {
    var id = req.params.id;
    var sql = "SELECT a.*, c.title as `category_title` "
              + "FROM feed a "
              + "INNER JOIN category c on a.category = c.id "
              + "WHERE a.id=?";

    conn.query(sql, [id], function(err, feed, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);

      } else {
        
            res.render('icheck/detail', {feed: feed[0],}
      )};
    })});

/*----------------------------------여기까지 FEED---------------------------------------------------------- */


  
  router.get('/kids', (req, res) => {
    var kid= req.params.id;
    var kidssql = "SELECT * FROM kids WHERE kid = ?";
    conn.query(kidssql, [kid], function(err, kids, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);

      } else {
        res.render('icheck/kids', {kids: kids})
      };
    });
  });

   /*KIDS 데이터 DB INSERT*/
  router.post('/kids/', upload.single('upload'), (req, res) => {
    var name = req.body.name;
    var clas = req.body.clas;
    var upload = req.file.filename;
    
    var sql = 'INSERT INTO kids (`name`, `clas`,`upload`, ) VALUES(?, ?, ?,)';
    conn.query(sql, [name, clas, upload], function(err, result, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);
      } else {
        res.redirect('icheck/kids/');
      }
    });
  });

return router;
  };