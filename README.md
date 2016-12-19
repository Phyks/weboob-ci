Weboob modules CI
=================

A small script exposing an API to store the status of
[Weboob](http://weboob.org) modules and track it over time.

A web visualisation is available, built on top of this API.


## Installation

1. Git clone the repo.
2. `pip install -r requirements.txt`
3. Copy `config.py.example` to `config.py` and edit according to your needs.

Then, you are ready to run `./weboob-ci/server.py`.


## API

The server exposes an API on the `/api` route.

### `GET /api/v1/modules`

Returns a JSON blob of the data shown on the index webpage (latest build for
each module).

```
curl http://SERVER/api/v1/modules
```

```
{
    "data": [
        {
            "origin": "toto",
            "status": "good",
            "module": "adecco",
            "datetime": "2016-11-30T12:05:03+00:00"
        },
        {
            "origin": "toto",
            "status": "bad",
            "module": "freemobile",
            "datetime": "2016-11-30T12:05:03+00:00"
        },
        ...
    ]
}
```

### `GET /api/v1/modules/<module>/<datetime_start>/<datetime_end>`

Returns a JSON blob of the builds for the specified module in the specified
datetime range.

```
curl http://SERVER/api/v1/modules/adecco/2016-11-20T05:00:00.000Z/2016-12-02T04:00:00.000Z
```

```
{
    "data": [
        {
            "origin": "toto",
            "status": "good",
            "module": "adecco",
            "datetime": "2016-11-30T12:05:03+00:00"
        },
        {
            "origin": "toto",
            "status": "good",
            "module": "adecco",
            "datetime": "2016-11-30T12:05:03+00:00"
        },
        ...
    ]
}
```


### `POST /api/v1/modules`

```
curl -H "Content-Type: application/json" --data "JSON_DATA" http://SERVER/api/v1/modules
```

where `JSON_DATA` is a JSON object containing at least the following keys:

<dl>
    <dt>modules</dt>
    <dd>A JSON object having two keys: bad and good. Each value must be an
    array of module names.</dd>
    <dt>origin</dt>
    <dd>A string identifying where the data comes from.</dd>
</dl>

and `SERVER` is your server URL.


A typical `JSON_DATA` is:
```
{
    "origin": "toto",
    "modules": {
        "bad": [
            "presseurop"
        ],
        "good": [
            "mangareader",
            "edf",
            "mangago",
            "adecco",
            "indeed"
		]
    }
}
```

_Note_: The `Content-Type` is important and must be sent correctly. You will
get a 400 HTTP error if the JSON query is not valid (either bad `Content-Type`
or invalid JSON object).


## License

All the code in this repo is under MIT license.


## Credits

* [Weboob](http://weboob.org/)

For the backend:

* [Arrow](http://crsmithdev.com/arrow/)
* [Bottle](http://bottlepy.org/)
* [Peewee](http://docs.peewee-orm.com/en/latest/)


For the frontend:

* [Cal-Heatmap](http://cal-heatmap.com/)
* [d3js](http://d3js.org/)
* [hint.css](https://kushagragour.in/lab/hint/)
* [moment](http://momentjs.com/)
* [normalize](https://necolas.github.io/normalize.css/)
* [fetch](https://github.com/github/fetch) and
  [`Promise`](https://github.com/taylorhakes/promise-polyfill) polyfills
