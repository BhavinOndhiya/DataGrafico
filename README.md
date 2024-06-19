Indian Private Companies API by GraphBud Technologies
Overview
This API allows users to access company details provided by the Ministry of Corporate Affairs (MCA) of India. The API offers endpoints to retrieve information about companies and their directors using Company Identification Numbers (CIN) and Director Identification Numbers (DIN).

Base URL
The base URL for the API is:

arduino
Copy code
https://api.datagrafi.co
Endpoints
Get Single Company Information
Retrieve information about a single company by providing its CIN.

Endpoint: /api/v1/company/{cin}

Method: GET

Parameters:
cin (path, required): Company Identification Number (CIN)
include (query, optional): Include all director's details
Responses:
200 OK: Successful response
Schema: CompanyResponse
404 Not Found: Company not found with the specified CIN
500 Internal Server Error: Internal Server Error
Get Multiple Companies Information
Retrieve information about multiple companies by providing an array of CINs.

Endpoint: /api/v1/companies

Method: POST

Request Body:
cin (array of strings, required): List of Company Identification Numbers (CIN)
Example: ["U98200UT2023PTC015565", "U98200UT2023PTC015566"]
Responses:
200 OK: Successful response
Schema: array of Company
404 Not Found: One or more companies with the given CINs not found
500 Internal Server Error: Internal Server Error
Get Single Director Information
Retrieve details of a director by providing their DIN.

Endpoint: /api/v1/director/{din}

Method: GET

Parameters:
din (path, required): Director Identification Number (DIN)
Responses:
200 OK: Successful response
Schema: Company
404 Not Found: Director details not found with the given DIN
500 Internal Server Error: Internal Server Error
Get Multiple Directors Information
Retrieve information about multiple directors by providing an array of DINs.

Endpoint: /api/v1/directors

Method: POST

Request Body:
din (array of strings, required): List of Director Identification Numbers (DIN)
Example: ["0010142513", "0010142514"]
Responses:
200 OK: Successful response
Schema: array of Company
404 Not Found: One or more directors with the given DINs not found
500 Internal Server Error: Internal Server Error
Components
Schemas
Company
Represents company information.

json
Copy code
{
  "cin": "string",
  "company_name": "string",
  "roc": "string",
  "company_reg_number": "integer",
  "sub_category": "string",
  "company_class": "string",
  "no_members": "integer",
  "date_of_registration": "string (date-time)",
  "email": "string",
  "listed_flag": "string",
  "last_agm_date": "string",
  "balance_sheet_date": "string",
  "registered_state": "string",
  "status": "string",
  "category": "string",
  "company_type": "string",
  "authorized_capital": "integer",
  "paidup_capital": "integer",
  "activity_code": "integer",
  "registered_office_address": "string",
  "date": "string (date-time)",
  "country": "string",
  "currency": "string",
  "year": "integer",
  "month": "integer",
  "day": "integer"
}
CompanyResponse
Represents the response for a single company query, including details about the company and its directors.

json
Copy code
{
  "company": {
    "$ref": "#/components/schemas/Company"
  },
  "directors": [
    {
      "$ref": "#/components/schemas/Person"
    }
  ]
}
Person
Represents director information.

json
Copy code
{
  "din": "string",
  "name": "string",
  "begin_date": "string (date)",
  "end_date": "string (date)",
  "cin": "string",
  "date": "string (date-time)",
  "year": "integer",
  "month": "integer",
  "day": "integer"
}
Examples
Example Request for Single Company Information
http
Copy code
GET /api/v1/company/U98200UT2023PTC015565?include=directors
Example Request for Multiple Companies Information
json
Copy code
POST /api/v1/companies
Content-Type: application/json

[
  "U98200UT2023PTC015565",
  "U98200UT2023PTC015566"
]
Example Request for Single Director Information
http
Copy code
GET /api/v1/director/0010142513
Example Request for Multiple Directors Information
json
Copy code
POST /api/v1/directors
Content-Type: application/json

[
  "0010142513",
  "0010142514"
]
Error Handling
The API provides the following error responses:

404 Not Found: When the requested company or director is not found.
500 Internal Server Error: When there is a server error processing the request.