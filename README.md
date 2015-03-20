Node TESS Search
==============================

There is no more direct way to interact with brands than a trademark search. This project
lets you interact with brands via JavaScript.

**(Work in progress!)**

This is a Node.js script that executes a search of <a href="http://www.uspto.gov/trademarks-application-process/search-trademark-database">TESS</a>,
the US Patent and Trademark Office's trademark search system, outputting a JSON array containing result page links
(currently useless!) and image URL links (useful for some purposes).

The term should be specified as a "free-form" TESS search term, meaning it can contain things like boolean operators, quoted exact matches,
and <a href="http://tess2.uspto.gov/tmdb/dscm/index.htm">Design Codes</a> in addition to regular search terms.


Usage
--------

Find all trademarks of Freedom™:

`node cli.js 'freedom[FM]'`

Find all trademarks with designs incorporating "costumed small mammals, rodents, kangaroos, wallabies":

`node cli.js '030926[dc]'`

Print debug info to help figure out why your search for wallabies went horribly wrong:

`node cli.js '030926[dc]' -loglevel=debug`


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


Disclaimer
-----------

TESS does not offer an API, this script relies on content scraping. It attempts to be a very well-behaved
scraper and, to the best of my knowledge, adheres to TESS's terms of use, but there are all kinds of reasons why
it could break at any time, so please do not use this as the foundational technology for your startup.
