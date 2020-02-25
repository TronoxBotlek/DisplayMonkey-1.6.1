/*!
* DisplayMonkey source file
* http://displaymonkey.org
*
* Copyright (c) 2015 Fuel9 LLC and contributors
*
* Released under the MIT license:
* http://opensource.org/licenses/MIT
*/

// 2015-03-08 [LTL] - weather BEGIN
// 2015-05-08 [LTL] - ready callback
// 2016-03-27 [LTL] - fixed onSuccess

/*********************************************************
Yahoo weather JSON sample: {
	"forecast" : [{
			"day" : "Mon",
			"date" : "9 Mar 2015",
			"low" : "49",
			"high" : "59",
			"text" : "Rain",
			"code" : "12"
		}, {
			"day" : "Tue",
			"date" : "10 Mar 2015",
			"low" : "56",
			"high" : "70",
			"text" : "Rain",
			"code" : "12"
		}, {
			"day" : "Wed",
			"date" : "11 Mar 2015",
			"low" : "52",
			"high" : "66",
			"text" : "Rain",
			"code" : "12"
		}, {
			"day" : "Thu",
			"date" : "12 Mar 2015",
			"low" : "57",
			"high" : "70",
			"text" : "Rain",
			"code" : "12"
		}, {
			"day" : "Fri",
			"date" : "13 Mar 2015",
			"low" : "54",
			"high" : "64",
			"text" : "Rain",
			"code" : "12"
		}
	],
	"location" : {
		"city" : "Lebanon",
		"region" : "TN",
		"country" : "United States"
	},
	"units" : {
		"temperature" : "F",
		"distance" : "mi",
		"pressure" : "in",
		"speed" : "mph"
	},
	"wind" : {
		"chill" : "57",
		"direction" : "140",
		"speed" : "5"
	},
	"atmosphere" : {
		"humidity" : "69",
		"visibility" : "10",
		"pressure" : "30.14",
		"rising" : "2"
	},
	"astronomy" : {
		"sunrise" : "7:05 am",
		"sunset" : "6:47 pm"
	},
	"condition" : {
		"text" : "Light Rain",
		"code" : "11",
		"temp" : "57",
		"date" : "Mon, 09 Mar 2015 5:51 pm CDT"
	}
}
*********************************************************/

function degToCompass(num) {
	var val = Math.floor((num / 22.5) + 0.5);
	var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
	return arr[(val % 16)];
}

DM.Weather = Class.create(/*PeriodicalExecuter*/ DM.FrameBase, {
    initialize: function ($super, options) {
        "use strict";
        $super(options, 'div.weather');
        var data = options.panel.data;
        this.tempU = data.TemperatureUnit || _canvas.temperatureUnit;
        this.woeid = data.Woeid || _canvas.woeid;

        this._callback();
    },

    _callback: function () {
        "use strict";
        if (this.exiting || this.updating)
            return;

        this.updating = true;
        new Ajax.Request("getYahooWeather.ashx", {
            method: 'get',
            parameters: $H({
                frame: this.frameId,
                panel: this.panelId,
                display: _canvas.displayId,
                woeid: this.woeid,
                tempU: this.tempU
            }),
            evalJSON: false,
            weather: this,

            onSuccess: function (resp) {
                var weather = resp.request.options.weather;
                try {
                    if (weather.exiting)
                        return;

                    var json = null;
                    if (resp.responseText.isJSON())
                        json = resp.responseText.evalJSON();
                    if (!json)
                        throw new Error("JSON expected"); // <-- shouldn't get here

                    if (json.Error)
                        throw new Error(json.Error);

                    if (json.location) {
                        weather.div.select('.location_city').each(function (e) { e.update(json.location.city); });
                        weather.div.select('.location_region').each(function (e) { e.update(json.location.region); });
                        weather.div.select('.location_country').each(function (e) { e.update(json.location.country); });
                    }

                    if (json.condition) {
						weather.div.select('.condition_code').each(function (e) { e.src = "files/weather/" + json.condition.code + ".gif"; });
						weather.div.select('.condition_img').each(function (e) { e.src = "files/weather2/" + json.condition.code + ".svg"; });
                        weather.div.select('.condition_text').each(function (e) { e.update(json.condition.text); });
                        weather.div.select('.condition_temp').each(function (e) { e.update(json.condition.temp); });
                    }

                    if (json.units) {
						weather.div.select('.units_temperature').each(function (e) { e.update(json.units.temperature); });
						weather.div.select('.units_speed').each(function (e) { e.update(json.units.speed); });
					}

					if (json.wind) {
						weather.div.select('.wind_speed').each(function (e) { e.update(json.wind.speed); });
						weather.div.select('.wind_direction').each(function (e) { e.update(degToCompass(json.wind.direction)); });
					}

					if (json.forecast) {
						var day = 0;
						for (day = 0; day < 5; day++) {
							var date = new Date(json.forecast[day].date);
							var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
							weather.div.select('.forecast' + day + '_day').each(function (e) { e.update(json.forecast[day].day); });
							weather.div.select('.forecast' + day + '_date').each(function (e) { e.update(date.getDate()); });
							weather.div.select('.forecast' + day + '_month').each(function (e) { e.update(months[date.getMonth()]); });
							weather.div.select('.forecast' + day + '_year').each(function (e) { e.update(date.getYear()); });
							weather.div.select('.forecast' + day + '_low').each(function (e) { e.update(json.forecast[day].low); });
							weather.div.select('.forecast' + day + '_high').each(function (e) { e.update(json.forecast[day].high); });
							weather.div.select('.forecast' + day + '_text').each(function (e) { e.update(json.forecast[day].text); });
							weather.div.select('.forecast' + day + '_code').each(function (e) { e.src = "files/weather/" + json.forecast[day].code + ".gif"; });
							weather.div.select('.forecast' + day + '_img').each(function (e) { e.src = "files/weather2/" + json.forecast[day].code + ".svg"; });
						}
					}
                }
                catch (e) {
                    new DM.ErrorReport({ exception: e, data: resp.responseText, source: "Weather::callBack::onSuccess" });
                }
                finally {
                    weather.updating = false;
                    //console.log(resp.responseText);
                    weather.ready();
                }
            },

            onFailure: function (resp) {
                var weather = resp.request.options.weather;
                new DM.ErrorReport({ exception: resp, source: "Weather::callBack::onFailure" });
                weather.updating = false;
                weather.ready();
            },
        });
    },
});

// weather END
