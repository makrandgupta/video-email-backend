var cheerio = require('cheerio');
var fs = require('fs');
var randtoken = require('rand-token');

var Email = require(appRoot + '/models/email');

module.exports = {
    saveEmailData: function (htmlData) {
        var email = new Email();      // create a new instance of the Bear model
        email.htmlData = htmlData.html();  // set the bears name (comes from the request)
        var token = randtoken.generate(16);
        console.log(token);
        email.token = token;
        // save the bear and check for errors
        email.save(function (err) {
            if (err)
                console.log(err);
            console.log('EmailData saved!');
        });
        return token;
    },

    getHTML: function (id, message) {

        var finalHTML = cheerio.load(fs.readFileSync('./public/html_templates/base_template_o.html'));
        finalHTML('#ytplayer')['0'].attribs['src'] = 'https://www.youtube.com/embed/' + id + '?modestbranding=1&autoplay=1&iv_load_policy=3&rel=0&showinfo=0';
        finalHTML('#messageIn').text(message);

        var token = this.saveEmailData(finalHTML);

        var $ = cheerio.load(fs.readFileSync('./public/html_templates/base_template.html'));
        $('#videoId')['0'].attribs['src'] = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
        $('#messageIn').text(message);
        $('#finalHTMLLink')['0'].attribs['href'] = 'http://10.0.1.8:8080/api/loadEmail/' + token;

        //a href = link+token
        var htmlData = $.html();
        return htmlData;
    }
};
