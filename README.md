# Patternlab with Twig boilerplate

Uses [Labcoat](https://github.com/pixotech/labcoat) to bootstrap a Twig-based instance of Patternlab. Includes preconfigured Gulp file and plugins to get started with Stylus and some PostCSS plugins.

## Requirements


- PHP 5.3+ - <http://patternlab.io/docs/requirements.html>
- Node.js (somewhat modern version)

## Installation

There are two methods for downloading and installing the Standard Edition for Twig:

* Download a pre-built project and `cd` to the directory
* Run `composer install`
* Run `node install`
* Run `npm install gulp -g` (you may have to run with `sudo` depending on your system)

## Usage

* `gulp serve` will run a web server, open the site in a browser and start watching your files. [Browsersync](https://www.browsersync.io/) updates the webpage automatically as you save changes.
* `gulp watch` will run a just watch your files that need build and build as you save.
* `gulp build` or just `gulp` will run build all of the things that need building and stop.