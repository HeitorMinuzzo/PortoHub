CREATE TABLE clients (
	id INTEGER PRIMARY KEY,
	name TEXT NOT NULL,
	cnpj TEXT NOT NULL UNIQUE,
	contact TEXT NOT NULL
) STRICT;
--> statement-breakpoint
CREATE TABLE processes (
	id INTEGER PRIMARY KEY,
	number TEXT NOT NULL COLLATE NOCASE UNIQUE,
	clientId INTEGER NOT NULL REFERENCES clients(id),
	openedAt TEXT NOT NULL,
	reference TEXT NOT NULL DEFAULT '',
	operation TEXT NOT NULL CHECK(operation IN ('importacao','exportacao')),
	mode TEXT NOT NULL CHECK(mode IN ('maritimo','aereo','rodoviario')),
	priority TEXT NOT NULL CHECK(priority IN ('normal','media','alta','urgente')),
	exporter TEXT NOT NULL DEFAULT '',
	agent TEXT NOT NULL DEFAULT '',
	agentReference TEXT NOT NULL DEFAULT '',
	carrier TEXT NOT NULL DEFAULT '',
	vessel TEXT NOT NULL DEFAULT '',
	origin TEXT NOT NULL DEFAULT '',
	destination TEXT NOT NULL DEFAULT '',
	departureDate TEXT NOT NULL DEFAULT '',
	arrivalDate TEXT NOT NULL DEFAULT '',
	closedAt TEXT
) STRICT;
--> statement-breakpoint
CREATE INDEX processes_opened ON processes(openedAt);
--> statement-breakpoint
CREATE INDEX processes_arrival ON processes(arrivalDate);
