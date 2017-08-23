Node TESS Search
==============================

There is no more direct way to interact with brands than a trademark search. This project
lets you interact with brands via JavaScript.

**(Work in progress!)**

This is a Node.js script that executes a search of [TESS](http://www.uspto.gov/trademarks-application-process/search-trademark-database),
the US Patent and Trademark Office's trademark search system, outputting a JSON array containing result page links
(currently useless!) and image URL links (useful for some purposes).

The term should be specified as a "free-form" TESS search term, meaning it can contain things like boolean operators, quoted exact matches,
and [Design Codes](http://tess2.uspto.gov/tmdb/dscm/index.htm) in addition to regular search terms.


Installation
-------------

* Ensure that you have Python 2 installed, as this project relies on [node-stream-mmmagic](https://github.com/seangarner/node-stream-mmmagic), which in turn relies on a native addon module built by node-gyp, which lacks Python 3 support.
    * If you have both Python 2 and Python 3 installed:
        * Make sure npm is configured to use Python 2, e.g.:
            * `which python2.7`
            * `npm config set python PYTHON_2_PATH_FROM_ABOVE`
        * Make sure you don't have "python" symlinked to python 3.

Usage
--------

Find all trademarks of Freedom™:

`node cli.js -t 'freedom[FM]'`

Find all trademarks with designs incorporating "costumed small mammals, rodents, kangaroos, wallabies":

`node cli.js -t '030926[dc]'`

Print help/documentation of flags:

`node cli.js`


Output Format
---------------

```
[
  {
    "imageUrl":"http://tmsearch.uspto.gov/ImageAgent/ImageAgentProxy?getImage=86464800&widthLimit=400&heightLimit=300",
    "docUrl":"http://tmsearch.uspto.gov/bin/gate.exe?f=doc&state=4809:nukzav.2.1",
    "full": { ... }  // object with fields corresponding to those displayed on TESS
  },
  ...
]
```


TODOs
---------

 * Support paging - there is a limit of 500 results until then!
 * Retry any failed document requests
 * Retrieve images
 * Fix logout - not consistently closing session


Disclaimer
-----------

TESS does not offer an API, this script relies on content scraping. It attempts to be a very well-behaved
scraper and, to the best of my knowledge, adheres to TESS's terms of use, but there are all kinds of reasons why
it could break at any time, so please do not use this as the foundational technology for your startup.
