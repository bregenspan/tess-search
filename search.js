/*global console, require*/

'use strict';

var rp = require('request-promise');
var cheerio = require('cheerio');

var HOST = 'http://tmsearch.uspto.gov';
var HANDLER_URL = HOST + '/bin/gate.exe';
var LOGIN = HANDLER_URL + '?f=login&p_lang=english&p_d=trmk';

rp = rp.defaults({ jar: true });

rp(LOGIN)
	.catch(console.error)
	.then(function (data) {
		var $ = cheerio.load(data),
			link = $('a:contains("Free Form")');
        if (link.length) {
            return HOST + link.attr('href');
        } else {
            throw 'Failed to find link to free-form search page!' + data;
        }
    })
    .then(function (link) {
        console.log(link);
        return rp(link);
    })
    .then(function (response) {
        var $ = cheerio.load(response);
        console.log(response);
        var formData = $('form[name=search_text]').serializeArray().reduce(function (o, v) {
            o[v.name] = v.value;
            return o;
        }, {});
        formData.p_s_ALL = '100102[dc] AND 030926[dc]';
        formData.p_lang = 'english';
        formData.a_search = 'Submit Query';
        console.log(formData);
        return rp.post({
            uri: HANDLER_URL,
            formData: formData
        });
	})
    .then(function (response) {
        console.log('EWAPOAW' + response + 'ASDASD');
    });
