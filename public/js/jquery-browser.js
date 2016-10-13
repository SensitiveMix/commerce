jQuery.extend({
	browser: function() 
	{
		var
	    rwebkit = /(webkit)\/([\w.]+)/,
	    ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
	    rmsie = /(msie) ([\w.]+)/,
	    rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,    
	    browser = {},
	    ua = window.navigator.userAgent,
	    browserMatch = uaMatch(ua);

	    if (browserMatch.browser) {
	        browser[browserMatch.browser] = true;
	        browser.version = browserMatch.version;
	    }
	    return { browser: browser };
	},
});

function uaMatch(ua) 
{
        ua = ua.toLowerCase();

        var match = rwebkit.exec(ua)
                    || ropera.exec(ua)
                    || rmsie.exec(ua)
                    || ua.indexOf("compatible") < 0 && rmozilla.exec(ua)
                    || [];

        return {
            browser : match[1] || "",
            version : match[2] || "0"
        };
}