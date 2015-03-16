/*global console, require*/

'use strict';

var rp = require('request-promise');
var cheerio = require('cheerio');

var HOST = 'http://tmsearch.uspto.gov';
var HANDLER_URL = HOST + '/bin/gate.exe';
var LOGIN = HANDLER_URL + '?f=login&p_lang=english&p_d=trmk';

var jar = rp.jar();

rp = rp.defaults({
	jar: jar,
	proxy: 'http://localhost:8888',
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0 (compatible; TESS-GIF)'
	}
});

rp(LOGIN)
	.catch(console.error)
	.then(function (data) {
        // Get a link to the search page (which includes session token)
		var $ = cheerio.load(data),
			link = $('a:contains("Free Form")');
        if (link.length) {
            return HOST + link.attr('href');
        } else {
            throw 'Failed to find link to search page!' + data;
        }
    })
    .then(function (link) {
        // Load the search page
        return rp(link, { resolveWithFullResponse: true });
    })
    .then(function (response) {
        // Search
        var $ = cheerio.load(response.body);
        console.log(response);
        var formData = $('form[name=search_text]').serializeArray().reduce(function (o, v) {
            o[v.name] = v.value;
            return o;
        }, {});
        formData.p_s_ALL = '100102[dc] AND 030926[dc]';
		formData.a_search = 'Submit Query';
		//jar.setCookie(rp.cookie('queryCookie=' + encodeURIComponent(formData.p_s_ALL)), HOST);

        return rp.post({
            uri: HANDLER_URL,
            form: formData,
			resolveWithFullResponse: true,
			headers: {
				Referer: response.request.href
			}
        });
	})
    .then(function (response) {
		console.log(response);
		console.log(response.req.headers);

        console.log('EWAPOAW' + response.body + 'ASDASD');
    });
