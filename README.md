Node TESS Search
==============================

**(Work in progress!)**

This is a Node.js script that executes a search of <a href="http://www.uspto.gov/trademarks-application-process/search-trademark-database">TESS</a>,
the US Patent and Trademark Office's trademark search system, outputting a JSON array containing result page links
(currently useless!) and image URL links (useful for some purposes).

The term should be specified as a "free-form" TESS search term, meaning it can contain things like boolean operators, quoted exact matches,
and <a href="http://tess2.uspto.gov/tmdb/dscm/index.htm">Design Codes</a> in addition to regular search terms.


Usage
--------

Find all trademarks of Freedom™:

`node tess.js 'freedom[FM]'`

Find all trademarks with designs incorporating "costumed small mammals, rodents, kangaroos, wallabies":

`node tess.js '030926[dc]'`

Print debug info to help figure out why your search for wallabies went horribly wrong:

`node tess.js '030926[dc]' -loglevel=debug`


Output Format
---------------

Output is near-useless at the moment and needs work:

```
[
  {
    "imageUrl":"http://tmsearch.uspto.gov/ImageAgent/ImageAgentProxy?getImage=86464800&widthLimit=400&heightLimit=300",
    "docUrl":"http://tmsearch.uspto.gov/bin/gate.exe?f=doc&state=4809:nukzav.2.1"
  },
  ...
]
```

(See TODOs)


TODOs
---------

 * After conducting a search, visit each result page and retrieve full data for each result, including registration
   dates, full wordmarks, and owners.
 * Automatically download all trademark images


Disclaimer
-----------

TESS does not offer an API, so this script relies on content scraping. It attempts to be a very well-behaved
scraper and, to the best of my knowledge, adheres to TESS's terms of use, but there are all kinds of reasons why
it could break at any time, so please do not use this as the foundational technology for your startup.
