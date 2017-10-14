var express = require('express');
// var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport       = require("passport");
var twitchStrategy = require("passport-facebook").Strategy;
var less = require('less');
var fs = require('fs');

var index = require('./routes/index');
var users = require('./routes/user');
var account = require('./routes/account');
var message = require('./routes/message');
var utils = require('./routes/utils');

var app = express();

// view engine setup
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ 
    secret: '1234567890',
    cookie: { maxAge: 600000 },
    resave: true,
    saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
// load mongoose package
var mongoose = require('mongoose');
// Use native Node promises
mongoose.Promise = global.Promise;
// connect to MongoDB
mongoose.connect('mongodb://18.221.167.219')
    .then(() =>  console.log('connection succesful'))
.catch((err) => console.error(err));

app.use('/', index);
app.use('/user', users);
app.use('/account', account);
app.use('/message', message);
app.use('/utils', utils);

// app.use(bodyParser({uploadDir:'./uploads'}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err); 
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error.html');
});

app.listen(3000);

//compile less files

// Load the file, convert to string
fs.readFile( './public/stylesheets/less/main.less', function (error, data) {
  var dataString = data.toString();
  var options = {
    paths         : ["./public/stylesheets/less"],      // .less file search paths
    outputDir     : "./public/stylesheets/css",   // output directory, note the '/'
    optimization  : 1,                // optimization level, higher is better but more volatile - 1 is a good value
    filename      : "main.less",       // root .less file
    compress      : true,             // compress?
    yuicompress   : true              // use YUI compressor?
  }; 
 
  // Create a file name such that
  //  if options.filename == gaf.js and options.compress = true
  //    outputfile = gaf.min.css
  options.outputfile = options.filename.split(".less")[0] + (options.compress ? ".min" : "") + ".css";
  // Resolves the relative output.dir to an absolute one and ensure the directory exist
  options.outputDir = path.resolve( process.cwd(), options.outputDir) + "/";
  ensureDirectory( options.outputDir );
 
  // Create a parser with options, filename is passed even though its loaded
  // to allow less to give us better errors
  var parser = new less.Parser(options);
  parser.parse( dataString, function ( error, cssTree ) {
      if ( error ) {
        less.writeError( error, options );
        return;
      }
 
    // Create the CSS from the cssTree
    var cssString = cssTree.toCSS( {
      compress   : options.compress,
      yuicompress: options.yuicompress
    } );
 
    // Write output
    fs.writeFileSync( options.outputDir + options.outputfile, cssString, 'utf8' );
    console.log("Converted Less: '" + options.filename + "', to CSS: " + options.outputDir + options.outputfile);
  });
});
 
//
var ensureDirectory = function (filepath) {
  var dir = path.dirname(filepath);
  var existsSync = fs.existsSync || path.existsSync;
  if (!existsSync(dir)) { fs.mkdirSync(dir); }
};

module.exports = app;
