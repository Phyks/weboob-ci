import arrow
import peewee

import config

db = getattr(peewee, config.DB_TYPE)(config.DB_URI)


class ModuleStatus(peewee.Model):
    module = peewee.CharField(max_length=255)  # Module name
    origin = peewee.CharField(max_length=255)  # Origin of the update
    datetime = peewee.DateTimeField(
        default=arrow.utcnow().replace(microsecond=0))
    is_good = peewee.BooleanField()  # True if good, False if bad

    class Meta:
        database = db


def init_db():
    db.connect()
    db.create_tables([ModuleStatus], True)
    db.close()
