# typescript-logging

Typescript and javascript library for logging. Simple and flexible.
Written in typescript, so easily integrates within any Typescript project 
in addition to normal javascript projects.

Can also be used in javascript projects, or in the browser directly (es5 compatible).

## Installation

Use npm to install for usage in your project.

~~~
npm install --save typescript-logging
~~~
No additional typings are required, these are included.


## Browser

To use in the browser with javascript directly, download the (minified) library from [here](https://github.com/mreuvers/typescript-logging/tree/master/downloads/bundle/0.1.2).
The library is exposed by global variable TSL. See the example below.

~~~~
<!DOCTYPE html>
<html>
  <head>
    <script type="text/javascript" src="typescript-logging-bundle.min.js"></script>
    <script type="text/javascript">
      // Create default logger
      var loggerFactory = TSL.LFService.createLoggerFactory();
      // Get a logger called "Hello"
      var logger = loggerFactory.getLogger("Hello");
      
      // Normal logging
      logger.info("Hello this is a log statement.");
      logger.error("Ooops", new Error("Failed!"));
      
      // With callbacks, this is useful when log statements are expensive (e.g. require calculation)
      // The callback is only called when needed.
      logger.infoc(function() { return "Only called when INFO (or lower) level is enabled!"; });
      logger.warnc(function() { return "Warn " + somethingVeryExpensive(); }, function() { return new Error("Oh oh"); }); 
    </script>
  </head>
</html>
~~~~

## Examples

Below follow a few examples on how to use the library in typescript.

### Create default LoggerFactory and log
~~~
  const factory = LFService.createLoggerFactory();
  const logger = factory.getLogger("SomeName");
  logger.info("Will log on info and higher by default");
~~~

### Create LoggerFactory, use closures for logging
~~~
  const factory = LFService.createLoggerFactory();
  const logger = factory.getLogger("SomeName");
  logger.infoc(() => "Will only be called for info level or higher");
  logger.errorc(() => "Failure", () => new Error("Something went wrong"));
~~~

### Create LoggerFactory, which logs on DEBUG (and higher) for all loggers.
~~~
  const factory = LFService.createLoggerFactory(new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Debug)));
  const logger = factory.getLogger("AnyName");
  logger.trace("Will not be logged");
  logger.debug("Will log");
  logger.info("Will log"); // etc.
~~~

### Create LoggerFactory which has different log levels for two groups
~~~
  const factory = LFService.createLoggerFactory(new LoggerFactoryOptions()
    .addLogGroupRule(new LogGroupRule(new RegExp("model\\..+"), LogLevel.INFO)))
    .addLogGroupRule(new LogGroupRule(new RegExp("service\\..+"), LogLevel.DEBUG)));
  const loggerModel = factory.getLogger("model.Person");  // This one will log on info and higher
  const loggerService = factory.getLogger("model.Service");  // This one will log on debug and higher
~~~

### Create LoggerFactory with different date format
~~~
  // The loggerfactory uses a different dateformat, and different date separator.
  const loggerFactory = LFService.createLoggerFactory(new LoggerFactoryOptions()
    .addLogGroupRule(new LogGroupRule(new RegExp(".+"),LogLevel.Info, new LogFormat(new DateFormat(DateFormatEnum.YearDayMonthWithFullTime,"/"))));
~~~

### Create LoggerFactory with custom logger
~~~
  // Custom logger, extend AbstractLogger which makes your life easy.
  class CustomLoggerImpl extends AbstractLogger {

    constructor(name: string, rule: LogGroupRule) {
      super(name, rule);
    }

    protected doLog(msg: string): void {
      // Do what you need to do with this log message!
    }    
  }   

  // The options, define LoggerType.Custom, then use a closure to return the new logger 
  // (this will be called by the library when it creates a new logger). 
  // Make sure to return a new instance, unless they are shareable between different loggers.
  const loggerOptions = new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp(".+"),LogLevel.Info, new LogFormat(), LoggerType.Custom,
      (name: string, logGroupRule: LogGroupRule) => new CustomLoggerImpl(name, logGroupRule)
  ));
  const loggerFactory = LFService.createLoggerFactory(loggerOptions);
  const logger = loggerFactory.getLogger("SomeName");  // This will return your logger now.
~~~


## API

This describes the more often used part of the typescript API. Keep in mind the javascript API is exactly the same (except you need to call things the javascript way).
Finally it's recommended to just look in the relevant classes hey contain the most up to date documentation.

### LFService

Use this to create and configure a LoggerFactory. The LoggerFactory is used to get loggers from.


~~~
  /**
   * Create a new LoggerFactory with given options (if any). If no options
   * are specified, the LoggerFactory, will accept any named logger and will
   * log on info level by default for, to the console.
   * @param options Options, optional.
   * @returns {LoggerFactory}
   */
  static createLoggerFactory(options?: LoggerFactoryOptions): LoggerFactory 
~~~ 


### LoggerFactoryOptions

You can specify the options for the LoggerFactory. Create a new LoggerFactoryOptions object and call method...

~~~
  /**
   * Add LogGroupRule, see {LogGroupRule) for details
   * @param rule Rule to add
   * @returns {LoggerFactoryOptions} returns itself
   */
  addLogGroupRule(rule: LogGroupRule): LoggerFactoryOptions  
~~~


### LogGroupRule

This describes basically everything for the LoggerFactory you are creating. Create a new LogGroupRule...

~~~
  /**
   * Create a LogGroupRule. Basically you define what logger name(s) match for this group, what level should be used what logger type (where to log)
   * and what format to write in. If the loggerType is custom, then the callBackLogger must be supplied as callback function to return a custom logger.
   * @param regExp Regular expression, what matches for your logger names for this group
   * @param level LogLevel
   * @param logFormat LogFormat
   * @param loggerType Type of logger, if Custom, make sure to implement callBackLogger and pass in, this will be called so you can return your own logger.
   * @param callBackLogger Callback function to return a new clean custom logger (yours!)
   */
  constructor(regExp: RegExp, level: LogLevel, logFormat: LogFormat = new LogFormat(), loggerType: LoggerType = LoggerType.Console, callBackLogger?: (name: string, logGroupRule: LogGroupRule)=>AbstractLogger)
~~~

The regular expression and logLevel are required, the first allows you to split your loggers in groups. For example a regex like: "model\\\\..+" would
specify that loggers with names like: model.Person, model.Something, all would use this LogGroupRule (and thus have whatever was specified here applied).

The logLevel specifies the level of logging when it's turned 'on'. E.g, the default is LogLevel.Info.

### LogLevel

Enumeration one of...

~~~

  Trace,
  Debug,
  Info,
  Warn,
  Error,
  Fatal
~~~

### LogFormat

LogFormat allows to set some options about what a log line should look like. Create a new LogFormat...

~~~
  /**
   * Constructor to create a LogFormat. Can be created without parameters where it will use sane defaults.
   * @param dateFormat DateFormat (what needs the date look like in the log line)
   * @param showTimeStamp Show date timestamp at all?
   * @param showLoggerName Show the logger name?
   */
  constructor(dateFormat: DateFormat = new DateFormat(), showTimeStamp: boolean = true, showLoggerName: boolean = true)
~~~

### DateFormat

Defines what the timestamp should look like. Create a new DateFormat... 

~~~
  /**
   * Constructor, can be called empty as it uses defaults.
   * @param formatEnum DateFormatEnum
   * @param dateSeparator Separator used between dates
   */
  constructor(formatEnum: DateFormatEnum = DateFormatEnum.Default, dateSeparator: string = '-')
~~~

The DateFormatEnum allows some change on how the date is formatted.

### DateFormatEnum

This is an enumeration with the following values:

~~~
  /**
   * Displays as: year-month-day hour:minute:second,millis -> 1999-02-12 23:59:59,123
   * Note the date separator can be set separately.
   */
  Default,

  /**
   * Displays as: year-month-day hour:minute:second -> 1999-02-12 23:59:59
   * Note the date separator can be set separately.
   */
  YearMonthDayTime,

  /**
   * Displays as: year-day-month hour:minute:second,millis -> 1999-12-02 23:59:59,123
   * Note the date separator can be set separately.
   */
  YearDayMonthWithFullTime,

  /**
   * Displays as: year-day-month hour:minute:second -> 1999-12-02 23:59:59
   * Note the date separator can be set separately.
   */
  YearDayMonthTime
~~~

## Tests

To run the tests:

~~~
npm run test
~~~

## Bugs

We all wish there were none in our software, but alas. If you encounter a bug please log it in the issue tracker.

## Contributing

Feel free to contribute or come up with great ideas, please use the issue tracker for that. 

If you add/change new functionality and want it merged to master, please open a pull request. Also add tests for it (spec directory).
Some things may not fit the library and could be rejected, so if you are unsure please ask first before wasting your valuable time.

## History

* 0.1.0 Initial release 