BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS company (
    cin TEXT PRIMARY KEY,
    company_name TEXT,
    roc TEXT,
    company_reg_number INTEGER,
    sub_category TEXT,
    company_class TEXT,
    no_members INTEGER,
    date_of_registration DATE,
    email TEXT,
    listed_flag TEXT,
    last_agm_date DATE, -- Change to DATE data type
    balance_sheet_date DATE, -- Change to DATE data type
    registered_state TEXT,
    company_status TEXT,
    category TEXT,
    company_type TEXT,
    authorized_capital INTEGER,
    paidup_capital INTEGER,
    principal_business_activity TEXT,
    activity_code INTEGER,
    registered_office_address TEXT,
    date DATE, -- Change to DATE data type
    country TEXT,
    currency TEXT,
    year INTEGER,
    month INTEGER,
    day INTEGER
);

COMMIT;
