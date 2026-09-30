# Data classes — which data may go to which AI vendor

*Required from T2 (OPERATING_MODEL §10). At T0 and T1, fill it in before any personal or regulated
data enters the project. This is the one file that owns this class of fact. Changing it is R3.*

An agent that would send a class of data to a vendor this table doesn't allow must stop and ask
the owner. Secrets go to no vendor, ever.

| Data class | Examples in this project | Allowed vendors | Required terms (training, retention, region) |
| --- | --- | --- | --- |
| Public | <published docs, open-source code> | <any> | — |
| Internal code | <this repository> | <vendor(s) under your agreement> | <no training; retention ≤ 30 days> |
| Secrets | <keys, tokens, passwords> | **none** | — |
| Personal data | <user records, emails> | <vendor with a data-processing agreement, or none> | <no training; zero retention; region> |
| Regulated | <health, payments, …> | <none unless counsel approves> | <per counsel> |
