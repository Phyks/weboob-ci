#!/usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import print_function

import arrow
import os
import peewee
import sys

import config
import models

from bottle import abort, default_app, get, post, request, run, static_file


@get("/")
def index():
    return server_static("index.html")


@get("/module/<name>")
def module(*args, **kwargs):
    return server_static("index.html")


@get("/api/v1/modules")
def get_api():
    models.db.connect()
    join_alias = models.ModuleStatus.alias()
    module_status = [
        {
            "module": row.module,
            "origin": row.origin,
            "datetime": arrow.get(row.datetime).isoformat(),
            "status": "good" if row.is_good else "bad"
        }
        # TODO: SQL query
        for row in (models.ModuleStatus
                    .select()
                    .join(
                        join_alias,
                        peewee.JOIN.LEFT_OUTER,
                        on=(
                            (models.ModuleStatus.module == join_alias.module) &
                            (models.ModuleStatus.datetime < join_alias.datetime)
                        )
                    )
                    .where(
                        join_alias.datetime.is_null()
                    )
                    .group_by(models.ModuleStatus.module)
                    .order_by(models.ModuleStatus.module.asc()))
    ]
    models.db.close()
    return {
        "data": module_status
    }


@post("/api/v1/modules")
def post_api():
    payload = request.json
    if not payload:
        abort(400, "Invalid JSON payload.")
    models.db.connect()
    try:
        for status in ["good", "bad"]:
            for module in payload["modules"][status]:
                models.ModuleStatus.create(
                    module=module,
                    origin=payload["origin"],
                    is_good=(status == "good")
                )
    except KeyError:
        abort(400, "Invalid JSON payload.")
    models.db.close()
    return "OK"


@get("/api/v1/modules/<module>/<datetime_start>/<datetime_end>")
def get_api_module_with_dates(module, datetime_start, datetime_end):
    datetime_start = arrow.get(datetime_start).datetime
    datetime_end = arrow.get(datetime_end).datetime
    models.db.connect()
    module_status = {
        module: [
            {
                "origin": row.origin,
                "datetime": arrow.get(row.datetime).isoformat(),
                "status": "good" if row.is_good else "bad"
            }
            for row in (models.ModuleStatus
                        .select()
                        .where(
                            (models.ModuleStatus.module == module) &
                            (models.ModuleStatus.datetime >= datetime_start) &
                            (models.ModuleStatus.datetime < datetime_end)
                        )
                        .order_by(models.ModuleStatus.datetime.asc()))
        ]
    }
    models.db.close()
    return {
        "data": module_status
    }


@get("/static/<filepath:path>")
def server_static(filepath):
    script_directory = os.path.dirname(os.path.realpath(__file__))
    return static_file(
        filepath,
        root=os.path.join(script_directory, "static")
    )


# Init db
models.init_db()

if __name__ == "__main__":
    DEBUG = config.DEBUG
    if len(sys.argv) > 3:
        HOST = sys.argv[1]
        PORT = int(sys.argv[2])
    else:
        HOST = config.HOST
        PORT = config.PORT

    # Log SQL queries in debug mode
    if DEBUG:
        import logging
        logger = logging.getLogger('peewee')
        logger.setLevel(logging.DEBUG)
        logger.addHandler(logging.StreamHandler())

    run(host=HOST, port=PORT, debug=DEBUG)
else:
    app = application = default_app()
